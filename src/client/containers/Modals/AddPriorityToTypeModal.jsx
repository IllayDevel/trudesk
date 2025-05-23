import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import some from 'lodash/some'
import $ from 'jquery'
import velocity from 'velocity'

import BaseModal from './BaseModal'
import Button from 'components/Button'

import { fetchSettings } from 'actions/settings'
import Log from '../../logger'
import api from 'api/index'

import helpers from 'lib/helpers'

class AddPriorityToTypeModal extends React.Component {
  constructor (props) {
    super(props)
  }

  getPriorities () {
    return this.props.settings && this.props.settings.get('priorities')
      ? this.props.settings.get('priorities').toArray()
      : []
  }

  onAddClick (e, type, priority) {
    e.preventDefault()
    const $addButton = $(e.target)
    const $check = $addButton.siblings('i.material-icons')

    api.tickets
      .addPriorityToType({ typeId: type.get('_id'), priority: priority.get('_id') })
      .then(() => {
        velocity(
          $addButton,
          { opacity: 0 },
          {
            duration: 350,
            complete: () => {
              $addButton.addClass('hide')
            }
          }
        )
        if ($check.length > 0) {
          velocity(
            $check,
            { opacity: 1 },
            {
              delay: 360,
              duration: 200,
              begin: () => {
                $check.show()
              }
            }
          )
        }

        this.props.fetchSettings()
      })
      .catch(error => {
        const errorText = error.response.data.error
        Log.error(errorText, error.response)
        helpers.UI.showSnackbar(`Ошибка: ${errorText}`, true)
      })
  }

  render () {
    const { type } = this.props
    return (
      <BaseModal>
        <form className='uk-form-stacked'>
          <div className='uk-margin-medium-bottom uk-clearfix'>
            <h2>Добавить приоритет</h2>
            <span>Пожалуйста, выберите приоритеты, которые вы хотите добавить к типу: {type.get('name')}</span>
          </div>
          <div className='priority-loop zone'>
            {this.getPriorities().map(priority => {
              if (some(type.get('priorities').toJS(), priority.toObject())) {
                return (
                  <div key={priority.get('_id')} className={'z-box uk-clearfix'}>
                    <div className='uk-float-left'>
                      <h5 style={{ color: priority.get('htmlColor'), fontWeight: 'bold' }}>{priority.get('name')}</h5>
                      <p className={'uk-text-muted'}>
                        SLA просрочен: <strong>{priority.get('durationFormatted')}</strong>
                      </p>
                    </div>
                    <div className='uk-float-right'>
                      <i className='material-icons uk-text-success mt-10 mr-15' style={{ fontSize: '28px' }}>
                        check
                      </i>
                    </div>
                  </div>
                )
              } else {
                return (
                  <div key={priority.get('_id')} className={'z-box uk-clearfix'}>
                    <div className='uk-float-left'>
                      <h5 style={{ color: priority.get('htmlColor'), fontWeight: 'bold' }}>{priority.get('name')}</h5>
                      <p className={'uk-text-muted'}>
                        SLA просрочен: <strong>{priority.get('durationFormatted')}</strong>
                      </p>
                    </div>
                    <div className='uk-float-right'>
                      <a
                        type={'button'}
                        className='uk-button uk-button-success mt-10 mr-10 no-ajaxy'
                        onClick={e => this.onAddClick(e, type, priority)}
                      >
                        Добавить
                      </a>
                      <i
                        className='material-icons uk-text-success mt-10 mr-15'
                        style={{ display: 'none', opacity: 0, fontSize: '28px' }}
                      >
                        check
                      </i>
                    </div>
                  </div>
                )
              }
            })}
          </div>
          <div className='uk-modal-footer uk-text-right'>
            <Button type={'button'} flat={true} waves={true} text={'Закрыть'} extraClass={'uk-modal-close'} />
          </div>
        </form>
      </BaseModal>
    )
  }
}

AddPriorityToTypeModal.propTypes = {
  settings: PropTypes.object.isRequired,
  type: PropTypes.object.isRequired,
  fetchSettings: PropTypes.func.isRequired
}

const mapStateToProps = state => ({
  settings: state.settings.settings
})

export default connect(
  mapStateToProps,
  { fetchSettings }
)(AddPriorityToTypeModal)
