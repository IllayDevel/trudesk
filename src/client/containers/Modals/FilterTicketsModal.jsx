import React from 'react'
import PropTypes from 'prop-types'
import { each } from 'lodash'
import { connect } from 'react-redux'
import { hideModal } from 'actions/common'
import { fetchGroups, unloadGroups } from 'actions/groups'
import { fetchAccounts, unloadAccounts } from 'actions/accounts'
import { getTagsWithPage, fetchTicketTypes, fetchTicketStatus } from 'actions/tickets'

import BaseModal from 'containers/Modals/BaseModal'
import SingleSelect from 'components/SingleSelect'
import Button from 'components/Button'

import helpers from 'lib/helpers'

class FilterTicketsModal extends React.Component {
  constructor (props) {
    super(props)
  }

  componentDidMount () {
    helpers.UI.inputs()
    this.props.fetchGroups()
    this.props.fetchAccounts({ page: 0, limit: -1, type: 'agents', showDeleted: false })
    this.props.getTagsWithPage({ limit: -1 })
    this.props.fetchTicketTypes()
    this.props.fetchTicketStatus()
  }

  componentDidUpdate () {
    helpers.UI.reRenderInputs()
  }

  componentWillUnmount () {
    this.props.unloadGroups()
    this.props.unloadAccounts()
  }

  onSubmit (e) {
    e.preventDefault()
    const startDate = e.target.filterDate_Start.value
    const endDate = e.target.filterDate_End.value
    const subject = e.target.subject.value
    const statuses = this.statusSelect.value
    const tags = this.tagsSelect.value
    const types = this.typesSelect.value
    const groups = this.groupSelect.value
    const assignees = this.assigneeSelect.value

    let queryString = '?f=1'
    if (startDate) queryString += `&ds=${startDate}`
    if (endDate) queryString += `&de=${endDate}`

    if (subject) queryString += `&fs=${subject}`

    each(statuses, i => {
      queryString += `&st=${i}`
    })

    each(types, i => {
      queryString += `&tt=${i}`
    })

    each(tags, i => {
      queryString += `&tag=${i}`
    })

    each(groups, i => {
      queryString += `&gp=${i}`
    })

    each(assignees, i => {
      queryString += `&au=${i}`
    })

    History.pushState(null, null, `/tickets/filter/${queryString}&r=${Math.floor(Math.random() * (99999 - 1 + 1)) + 1}`)
    this.props.hideModal()
  }

  render () {
    const statuses = this.props.ticketStatuses.map(s => ({ text: s.get('name'), value: s.get('_id') })).toArray()

    const tags = this.props.ticketTags
      .map(t => {
        return { text: t.get('name'), value: t.get('_id') }
      })
      .toArray()

    const types = this.props.ticketTypes
      .map(t => {
        return { text: t.get('name'), value: t.get('_id') }
      })
      .toArray()

    const groups = this.props.groupsState.groups
      .map(g => {
        return { text: g.get('name'), value: g.get('_id') }
      })
      .toArray()

    const assignees = this.props.accountsState.accounts
      .map(a => {
        return { text: a.get('fullname'), value: a.get('_id') }
      })
      .toArray()

    return (
      <BaseModal options={{ bgclose: false }}>
        <h2 style={{ marginBottom: 20 }}>Фильтр задач</h2>
        <form className={'uk-form-stacked'} onSubmit={e => this.onSubmit(e)}>
          <div className='uk-margin-medium-bottom'>
            <label>Тема</label>
            <input type='text' name={'subject'} className={'md-input'} />
          </div>
          <div className='uk-grid uk-grid-collapse uk-margin-small-bottom'>
            <div className='uk-width-1-2' style={{ padding: '0 15px 0 0' }}>
              <label htmlFor='filterDate_Start' className='uk-form-label nopadding nomargin'>
                Дата начала
              </label>
              <input
                id='filterDate_Start'
                className='md-input'
                name='filterDate_Start'
                type='text'
                data-uk-datepicker={"{format:'" + helpers.getShortDateFormat() + "'}"}
              />
            </div>
            <div className='uk-width-1-2' style={{ padding: '0 0 0 15px' }}>
              <label htmlFor='filterDate_End' className='uk-form-label nopadding nomargin'>
                Дата окончания
              </label>
              <input
                id='filterDate_End'
                className='md-input'
                name='filterDate_End'
                type='text'
                data-uk-datepicker={"{format:'" + helpers.getShortDateFormat() + "'}"}
              />
            </div>
          </div>
          <div className='uk-grid uk-grid-collapse uk-margin-small-bottom'>
            <div className='uk-width-1-1'>
              <label htmlFor='filterStatus' className='uk-form-label' style={{ paddingBottom: 0, marginBottom: 0 }}>
                Статус
              </label>
              <SingleSelect items={statuses} showTextbox={false} multiple={true} ref={r => (this.statusSelect = r)} />
            </div>
          </div>
          <div className='uk-grid uk-grid-collapse uk-margin-small-bottom'>
            <div className='uk-width-1-1'>
              <label htmlFor='filterStatus' className='uk-form-label' style={{ paddingBottom: 0, marginBottom: 0 }}>
                Тэги
              </label>
              <SingleSelect items={tags} showTextbox={true} multiple={true} ref={r => (this.tagsSelect = r)} />
            </div>
          </div>
          <div className='uk-grid uk-grid-collapse uk-margin-small-bottom'>
            <div className='uk-width-1-1'>
              <label htmlFor='filterStatus' className='uk-form-label' style={{ paddingBottom: 0, marginBottom: 0 }}>
                Тип
              </label>
              <SingleSelect items={types} showTextbox={false} multiple={true} ref={r => (this.typesSelect = r)} />
            </div>
          </div>
          <div className='uk-grid uk-grid-collapse uk-margin-small-bottom'>
            <div className='uk-width-1-1'>
              <label htmlFor='filterStatus' className='uk-form-label' style={{ paddingBottom: 0, marginBottom: 0 }}>
                Ответсвенный
              </label>
              <SingleSelect
                items={assignees}
                showTextbox={false}
                multiple={true}
                ref={r => (this.assigneeSelect = r)}
              />
            </div>
          </div>
          <div className='uk-grid uk-grid-collapse uk-margin-small-bottom'>
            <div className='uk-width-1-1'>
              <label htmlFor='filterStatus' className='uk-form-label' style={{ paddingBottom: 0, marginBottom: 0 }}>
                Группы
              </label>
              <SingleSelect items={groups} showTextbox={false} multiple={true} ref={r => (this.groupSelect = r)} />
            </div>
          </div>
          <div className='uk-modal-footer uk-text-right'>
            <Button text={'Отмена'} flat={true} waves={true} extraClass={'uk-modal-close'} />
            <Button text={'Фильтровать'} style={'primary'} flat={false} type={'submit'} />
          </div>
        </form>
      </BaseModal>
    )
  }
}

FilterTicketsModal.propTypes = {
  viewdata: PropTypes.object.isRequired,
  groupsState: PropTypes.object.isRequired,
  accountsState: PropTypes.object.isRequired,
  hideModal: PropTypes.func.isRequired,
  fetchGroups: PropTypes.func.isRequired,
  unloadGroups: PropTypes.func.isRequired,
  fetchAccounts: PropTypes.func.isRequired,
  unloadAccounts: PropTypes.func.isRequired,
  getTagsWithPage: PropTypes.func.isRequired,
  ticketTags: PropTypes.object.isRequired,
  fetchTicketTypes: PropTypes.func.isRequired,
  ticketTypes: PropTypes.object.isRequired,
  fetchTicketStatus: PropTypes.func.isRequired,
  ticketStatuses: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
  viewdata: state.common.viewdata,
  groupsState: state.groupsState,
  accountsState: state.accountsState,
  ticketTags: state.tagsSettings.tags,
  ticketTypes: state.ticketsState.types,
  ticketStatuses: state.ticketsState.ticketStatuses
})

export default connect(mapStateToProps, {
  hideModal,
  fetchGroups,
  unloadGroups,
  fetchAccounts,
  unloadAccounts,
  getTagsWithPage,
  fetchTicketTypes,
  fetchTicketStatus
})(FilterTicketsModal)
