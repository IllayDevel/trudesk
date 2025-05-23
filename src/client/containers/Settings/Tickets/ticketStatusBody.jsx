import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { observer } from 'mobx-react'
import Input from 'components/Input'
import { makeObservable, observable } from 'mobx'
import { fetchSettings } from 'actions/settings'
import { showModal, hideModal } from 'actions/common'
import ColorSelector from 'components/ColorSelector'
import Button from 'components/Button'
import EnableSwitch from 'components/Settings/EnableSwitch'

import api from 'api'
import helpers from 'lib/helpers'

@observer
class TicketStatusBody extends React.Component {
  @observable statusName = ''
  @observable htmlColor = ''
  @observable slatimer = ''
  @observable isResolved = ''
  constructor (props) {
    super(props)
    makeObservable(this)
  }

  componentDidMount () {
    this.statusName = this.props.status.get('name') || ''
    this.htmlColor = this.props.status.get('htmlColor') || ''
    this.isResolved = this.props.status.get('isResolved') || false
    this.slatimer = this.props.status.get('slatimer') || false
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    if (this.statusName === '') this.statusName = this.props.status.get('name') || ''
    if (this.htmlColor === '') this.htmlColor = this.props.status.get('htmlColor') || ''
    if (this.isResolved === '') this.isResolved = this.props.status.get('isResolved') || false
    if (this.slatimer === '') this.slatimer = this.props.status.get('slatimer') || false
  }

  onSaveClicked (e) {
    const id = this.props.status.get('_id')
    const name = this.statusName
    const htmlColor = this.htmlColor
    const isResolved = this.isResolved
    const slatimer = this.slatimer

    api.tickets
      .updateStatus({ id, name, htmlColor, isResolved, slatimer })
      .then(res => {
        helpers.UI.showSnackbar('Статус обновлен')
        this.props.fetchSettings()
      })
      .catch(e => {
        console.log(e)
        helpers.UI.showSnackbar(e, true)
      })
  }

  showDeleteTicketStatusModal (e, status) {
    this.props.showModal('DELETE_STATUS', { status })
  }

  render () {
    return (
      <div>
        <form>
          <div className={'ticket-status-general-wrapper'}>
            <h2 className='text-light'>Главная</h2>
            <hr style={{ margin: '5px 0 25px 0' }} />
            <div style={{ marginBottom: 15 }}>
              <label style={{ display: 'inline-block', cursor: 'pointer' }}>Наименование</label>
              <Input defaultValue={this.statusName} onChange={v => (this.statusName = v)} />
            </div>
            <div style={{ marginBottom: 15 }}>
              <label style={{ display: 'inline-block', cursor: 'pointer' }}>Цвет статуса</label>
              <ColorSelector
                showLabel={false}
                hideRevert={true}
                defaultColor={this.htmlColor}
                onChange={e => (this.htmlColor = e.target.value)}
              />
            </div>
          </div>
          <h2 className='text-light mt-25'>Свойства</h2>
          <hr style={{ margin: '5px 0 25px 0' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
            <h4 className={'uk-width-1-2'} style={{ flexGrow: 1 }}>
              Таймер SLA
            </h4>
            <EnableSwitch
              stateName={`slatimer_${this.props.status.get('_id')}`}
              label={'Да'}
              checked={this.slatimer}
              onChange={e => (this.slatimer = e.target.checked)}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
            <h4 className={'uk-width-1-2'} style={{ flexGrow: 1 }}>
             Решение
            </h4>
            <EnableSwitch
              stateName={`isResolved_${this.props.status.get('_id')}`}
              label={'Да'}
              checked={this.isResolved}
              onChange={e => (this.isResolved = e.target.checked)}
            />
          </div>
          <div className={'uk-margin-large-top'} style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button text={'Сохранить статус'} style={'success'} onClick={e => this.onSaveClicked(e)} />
          </div>
        </form>
        {!this.props.status.get('isLocked') && (
          <>
            <div className={'uk-margin-large-top'} style={{ display: 'block', height: 15 }} />
            <div className={'uk-margin-large-top'}>
              <h2 className='text-light'>Danger Zone</h2>
              <div className='danger-zone'>
                <div className='dz-box uk-clearfix'>
                  <div className='uk-float-left'>
                    <h5>Удалить этот статус</h5>
                    <p>Удаления статуса не возможно отменить!</p>
                  </div>
                  <div className='uk-float-right' style={{ paddingTop: '10px' }}>
                    <Button
                      text={'Удалить'}
                      small={true}
                      style={'danger'}
                      onClick={e => this.showDeleteTicketStatusModal(e, this.props.status)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }
}

TicketStatusBody.propTypes = {
  status: PropTypes.object.isRequired,
  fetchSettings: PropTypes.func.isRequired,
  showModal: PropTypes.func.isRequired,
  hideModal: PropTypes.func.isRequired
}

export default connect(null, { fetchSettings, showModal, hideModal })(TicketStatusBody)
