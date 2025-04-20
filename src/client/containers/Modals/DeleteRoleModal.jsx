import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { observer } from 'mobx-react'
import { makeObservable, observable } from 'mobx'

import { deleteRole } from 'actions/settings'

import BaseModal from './BaseModal'
import Button from 'components/Button'
import SingleSelect from 'components/SingleSelect'

@observer
class DeleteRoleModal extends React.Component {
  @observable selectedRole = ''

  constructor (props) {
    super(props)
    makeObservable(this)
  }

  onSelectChanged (e) {
    this.selectedRole = e.target.value
  }

  onFormSubmit (e) {
    e.preventDefault()

    this.props.deleteRole({ _id: this.props.role.get('_id'), newRoleId: this.selectedRole })
  }

  render () {
    const { role } = this.props
    const mappedRoles = this.props.shared.roles
      .filter(obj => {
        return obj.get('_id') !== role.get('_id')
      })
      .map(r => {
        return { text: r.get('name'), value: r.get('_id') }
      })
      .toArray()
    return (
      <BaseModal {...this.props} options={{ bgclose: false }}>
        <form className={'uk-form-stacked'} onSubmit={e => this.onFormSubmit(e)}>
          <div className='uk-margin-medium-bottom uk-clearfix'>
            <h2>Удаление роли</h2>
            <span>Выберите роль, которую вы хотите назначить ВСЕМ пользователям с выбраной ролью.</span>
            {/*<hr style={{ margin: '10px 0' }} />*/}
          </div>
          <div className='uk-margin-medium-bottom uk-clearfix'>
            <div className='uk-float-left' style={{ width: '100%' }}>
              <label className={'uk-form-label nopadding nomargin'}>Тип</label>
              <SingleSelect
                showTextbox={false}
                items={mappedRoles}
                onSelectChange={e => this.onSelectChanged(e)}
                value={this.selectedRole}
              />
            </div>
          </div>
          <div className='uk-margin-medium-bottom uk-clearfix'>
            <span className='uk-text-danger'>
              ВНИМАНИЕ: Это изменит все учетные записи с ролью <strong>{role.get('name')}</strong> с выбраной ролью выше.
              {role.get('isAdmin') && (
                <span className={'uk-text-danger'}>
                 Роль, которую вы собираетесь удалить, является ролью администратора. Убедитесь, что есть другая роль администратора, иначе вы можете быть заблокированы!
                </span>
              )}
              <br />
              <br />
              <strong style={{ fontSize: '18px' }}>Это навсегда!</strong>
            </span>
          </div>
          <div className='uk-modal-footer uk-text-right'>
            <Button text={'Отмена'} flat={true} waves={true} extraClass={'uk-modal-close'} />
            <Button text={'Удалить'} style={'danger'} flat={true} type={'submit'} />
          </div>
        </form>
      </BaseModal>
    )
  }
}

DeleteRoleModal.propTypes = {
  role: PropTypes.object,
  deleteRole: PropTypes.func.isRequired,
  shared: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
  shared: state.shared
})

export default connect(mapStateToProps, { deleteRole })(DeleteRoleModal)
