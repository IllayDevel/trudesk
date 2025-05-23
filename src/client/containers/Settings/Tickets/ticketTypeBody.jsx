import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Log from '../../../logger'
import $ from 'jquery'

import helpers from 'lib/helpers'
import { fetchSettings } from 'actions/settings'
import { updatePriority } from 'actions/tickets'
import { showModal } from 'actions/common'
import api from 'api/index'

import Button from 'components/Button'
import SettingSubItem from 'components/Settings/SettingSubItem'
import ButtonGroup from 'components/ButtonGroup'
import EditPriorityPartial from './editPriorityPartial'

class TicketTypeBody extends React.Component {
  constructor (props) {
    super(props)
    this.prioritiesRef = {}
  }

  componentDidMount () {
    helpers.UI.inputs()
  }

  handleTypeRename (event) {
    event.preventDefault()
    const name = event.target.name.value

    api.tickets
      .renameTicketType(this.props.type.get('_id'), name)
      .then(response => {
        if (response.success) helpers.UI.showSnackbar('Тип обновлен')
        this.props.fetchSettings()
      })
      .catch(err => {
        helpers.UI.showSnackbar(err, true)
      })
  }

  onAddPriorityClick (e, type) {
    this.props.showModal('ADD_PRIORITY_TO_TYPE', { type })
  }

  toggleEditPriority (e, k) {
    const obj = this.prioritiesRef[k]
    const $v = $(obj).find('.view-priority')
    const $e = $(obj).find('.edit-priority')
    if ($v && $e) {
      $v.toggleClass('hide')
      $e.toggleClass('hide')
    }
  }

  onRemoveTicketTypePriorityClicked (e, priorityId) {
    e.preventDefault()

    api.tickets
      .removePriorityFromType({ typeId: this.props.type.get('_id'), priority: priorityId })
      .then(() => {
        helpers.UI.showSnackbar(`Приоритет удален из типа: ${this.props.type.get('name')}`)
        this.props.fetchSettings()
      })
      .catch(error => {
        if (!error.response) {
          Log.error(error)
          return
        }
        const errorText = error.response.data.error
        Log.error(errorText, error.response)
        helpers.UI.showSnackbar(`Error: ${errorText}`, true)
      })
  }

  showDeleteTicketTypeModal (e, type) {
    this.props.showModal('DELETE_TICKET_TYPE', { type })
  }

  render () {
    const { type } = this.props
    return (
      <div>
        <div className={'ticket-type-general-wrapper'}>
          <h2 className={'text-light'}>Главные</h2>
          <hr style={{ margin: '5px 0 25px 0' }} />
          <form
            onSubmit={e => {
              this.handleTypeRename(e)
            }}
          >
            <div className='uk-input-group'>
              <label htmlFor='ticket-type-name'>Type Name</label>
              <input name={'name'} type='text' className={'md-input'} defaultValue={type.get('name')} />
              <div className='uk-input-group-addon'>
                <button type='submit' className={'md-btn md-btn-small'}>
                  Переименовать
                </button>
              </div>
            </div>
          </form>
        </div>
        <div className='ticket-type-priorities-wrapper uk-margin-medium-top'>
          <h2 className='text-light uk-display-inline-block'>
            Настройки
            <i
              className='material-icons'
              style={{ color: '#888', fontSize: '16px', cursor: 'pointer', lineHeight: '18px', marginLeft: '5px' }}
              data-uk-tooltip="{cls:'long-text'}"
              title={'Priorities linked to this type. <br /> Editing a priority will update all types linked.'}
            >
              help
            </i>
          </h2>
          <div className='uk-float-right'>
            <Button
              text={'Добавить'}
              style={'success'}
              flat={true}
              waves={true}
              onClick={e => this.onAddPriorityClick(e, type)}
            />
          </div>
          <hr style={{ margin: '5px 0 25px 0' }} />
          <div className='priority-loop zone'>
            {type.get('priorities').map(item => {
              return (
                <div
                  key={item.get('_id')}
                  ref={i => (this.prioritiesRef[item.get('_id')] = i)}
                  className={'z-box uk-clearfix'}
                >
                  <div className={'view-priority uk-clearfix'}>
                    <SettingSubItem
                      title={item.get('name')}
                      titleCss={{ color: item.get('htmlColor') }}
                      subtitle={
                        <div>
                          Просрочен SLA: <strong>{item.get('durationFormatted')}</strong>
                        </div>
                      }
                      component={
                        <ButtonGroup classNames={'uk-float-right'}>
                          <Button
                            text={'Редактировать'}
                            small={true}
                            onClick={e => this.toggleEditPriority(e, item.get('_id'))}
                          />
                          <Button
                            text={'Удалить'}
                            small={true}
                            style={'danger'}
                            onClick={e => this.onRemoveTicketTypePriorityClicked(e, item.get('_id'))}
                          />
                        </ButtonGroup>
                      }
                    />
                  </div>
                  <EditPriorityPartial priority={item} />
                </div>
              )
            })}
          </div>
        </div>
        <div className={'uk-margin-large-top'}>
          <h2 className='text-light'>Опасная зона</h2>
          <div className='danger-zone'>
            <div className='dz-box uk-clearfix'>
              <div className='uk-float-left'>
                <h5>Удалить этот тип</h5>
                <p>Это необратимое действие!</p>
              </div>
              <div className='uk-float-right' style={{ paddingTop: '10px' }}>
                <Button
                  text={'Удалить'}
                  small={true}
                  style={'danger'}
                  onClick={e => this.showDeleteTicketTypeModal(e, type)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

TicketTypeBody.propTypes = {
  type: PropTypes.object.isRequired,
  updatePriority: PropTypes.func.isRequired,
  fetchSettings: PropTypes.func.isRequired,
  showModal: PropTypes.func.isRequired
}

export default connect(
  null,
  { updatePriority, fetchSettings, showModal }
)(TicketTypeBody)
