import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { fetchTicketStatus, deleteStatus } from 'actions/tickets'
import BaseModal from './BaseModal'
import Button from 'components/Button'
import SingleSelect from 'components/SingleSelect'

import helpers from 'lib/helpers'

class DeleteTicketStatusModal extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      selectedStatus: ''
    }
  }

  componentDidMount () {}

  getTicketStatuses () {
    return this.props.settings && this.props.settings.get('status') ? this.props.settings.get('status').toArray() : []
  }

  onSelectChanged (e) {
    this.setState({
      selectedStatus: e.target.value
    })
  }

  onFormSubmit (e) {
    e.preventDefault()
    if (!this.state.selectedStatus) {
      helpers.UI.showSnackbar('Не могу получить список статусов задачи. Сброс...', true)
      return true
    }

    this.props.deleteStatus({ id: this.props.status.get('_id'), newStatusId: this.state.selectedStatus })
  }

  render () {
    const { status } = this.props
    const mappedStatuses = this.getTicketStatuses()
      .filter(obj => {
        return status.get('name') !== obj.get('name')
      })
      .map(item => {
        return { text: item.get('name'), value: item.get('_id') }
      })
    return (
      <BaseModal {...this.props} options={{ bgclose: false }}>
        <form className={'uk-form-stacked'} onSubmit={e => this.onFormSubmit(e)}>
          <div className='uk-margin-medium-bottom uk-clearfix'>
            <h2>Удалить статус задачи</h2>
            <span>
              Чтобы удалить статус задачи, выберите статус, который вы хотите переназначить.
            </span>
          </div>
          <div className='uk-margin-medium-bottom uk-clearfix'>
            <div className='uk-float-left' style={{ width: '100%' }}>
              <label className={'uk-form-label nopadding nomargin'}>Status</label>
              <SingleSelect
                showTextbox={false}
                items={mappedStatuses}
                onSelectChange={e => this.onSelectChanged(e)}
                value={this.state.selectedStatus}
              />
            </div>
          </div>
          <div className='uk-margin-medium-bottom uk-clearfix'>
            <span className='uk-text-danger'>
             ВНИМАНИЕ: Это изменит все тикеты со статусом <strong>{status.get('name')}</strong> на выбранный статус задачи.
              <br />
              <strong>Это навсегда!</strong>
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

DeleteTicketStatusModal.propTypes = {
  status: PropTypes.object.isRequired,
  settings: PropTypes.object.isRequired,
  deleteStatus: PropTypes.func.isRequired,
  fetchTicketStatus: PropTypes.func.isRequired
}

const mapStateToProps = state => ({
  settings: state.settings.settings,
  ticketStatuses: state.ticketsState.ticketStatuses
})

export default connect(mapStateToProps, { fetchTicketStatus, deleteStatus })(DeleteTicketStatusModal)
