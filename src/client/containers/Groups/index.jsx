import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { fetchGroups, deleteGroup } from 'actions/groups'
import { showModal } from 'actions/common'

import Avatar from 'components/Avatar/Avatar'
import PageTitle from 'components/PageTitle'
import PageContent from 'components/PageContent'
import Button from 'components/Button'
import Table from 'components/Table'
import TableHeader from 'components/Table/TableHeader'
import TableRow from 'components/Table/TableRow'
import TableCell from 'components/Table/TableCell'
import ButtonGroup from 'components/ButtonGroup'

import UIKit from 'uikit'
import helpers from 'lib/helpers'

class GroupsContainer extends React.Component {
  componentDidMount () {
    this.props.fetchGroups({ type: 'all' })
  }

  onCreateGroupClick () {
    this.props.showModal('CREATE_GROUP')
  }

  onEditGroupClick (group) {
    this.props.showModal('EDIT_GROUP', { group })
  }

  onDeleteGroupClick (_id) {
    UIKit.modal.confirm(
      `<h2>Вы уверены?</h2>
        <p style="font-size: 15px;">
            <span class="uk-text-danger" style="font-size: 15px;">Это действие невозможно отменить.</span> 
        </p>
        <p style="font-size: 12px;">
           После удаления этой группы агенты могут потерять доступ к ресурсам.
        </p>
        <span>Группы, связанные с тикетом, не могут быть удалены..</span>
        `,
      () => {
        this.props.deleteGroup({ _id })
      },
      {
        labels: { Ok: 'Да', Cancel: 'Нет' },
        confirmButtonClass: 'md-btn-danger'
      }
    )
  }

  render () {
    const { groups } = this.props

    const tableItems = groups.map(group => {
      return (
        <TableRow key={group.get('_id')} className={'vam nbb'}>
          <TableCell style={{ fontWeight: 500, padding: '18px 15px' }}>{group.get('name')}</TableCell>
          <TableCell style={{ padding: '13px 20px 8px 8px' }}>
            {group.get('members') &&
              group.get('members').size > 0 &&
              group
                .get('members')
                .filter(user => {
                  return !user.get('deleted')
                })
                .map(user => {
                  const profilePic = user.get('image') || 'defaultProfile.jpg'
                  return (
                    <div
                      key={user.get('_id')}
                      className={'uk-float-left uk-position-relative mb-10'}
                      data-uk-tooltip={'{pos: "bottom"}'}
                      title={user.get('fullname')}
                    >
                      <Avatar size={25} style={{ marginRight: 5 }} image={profilePic} userId={user.get('_id')} />
                    </div>
                  )
                })}
            {!group.get('members') && <div />}
          </TableCell>
          <TableCell style={{ textAlign: 'right', paddingRight: 15 }}>
            <ButtonGroup>
              {helpers.canUser('groups:update', true) && (
                <Button text={'Редактировать'} small={true} waves={true} onClick={() => this.onEditGroupClick(group.toJS())} />
              )}
              {helpers.canUser('groups:delete', true) && (
                <Button
                  text={'Удалить'}
                  style={'danger'}
                  small={true}
                  waves={true}
                  onClick={() => this.onDeleteGroupClick(group.get('_id'))}
                />
              )}
            </ButtonGroup>
          </TableCell>
        </TableRow>
      )
    })

    return (
      <div>
        <PageTitle
          title={'Группы пользователей'}
          rightComponent={
            <div className={'uk-grid uk-grid-collapse'}>
              <div className={'uk-width-1-1 mt-15 uk-text-right'}>
                <Button
                  text={'Создать'}
                  flat={false}
                  small={true}
                  waves={false}
                  extraClass={'hover-accent'}
                  onClick={() => this.onCreateGroupClick()}
                />
              </div>
            </div>
          }
        />
        <PageContent padding={0} paddingBottom={0}>
          <Table
            headers={[
              <TableHeader key={0} width={'25%'} height={40} text={'Имя'} padding={'8px 8px 8px 15px'} />,
              <TableHeader key={1} width={'50%'} text={'Пользователи'} />,
              <TableHeader key={2} width={130} text={'Действия'} />
            ]}
          >
            {tableItems}
          </Table>
        </PageContent>
      </div>
    )
  }
}

GroupsContainer.propTypes = {
  groups: PropTypes.object.isRequired,
  fetchGroups: PropTypes.func.isRequired,
  deleteGroup: PropTypes.func.isRequired,
  showModal: PropTypes.func.isRequired
}

const mapStateToProps = state => ({
  groups: state.groupsState.groups
})

export default connect(mapStateToProps, { fetchGroups, deleteGroup, showModal })(GroupsContainer)
