import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import $ from 'jquery'

import ColorSelector from 'components/ColorSelector'
import Button from 'components/Button'

import { fetchSettings } from 'actions/settings'
import api from 'api/index'
import Log from '../../../logger'
import helpers from 'lib/helpers'

class EditPriorityPartial extends React.Component {
  constructor (props) {
    super(props)
  }

  toggleEditPriority () {
    const $parent = $(this.editPriorityRef).parent()
    const $v = $parent.find('.view-priority')
    const $e = $parent.find('.edit-priority')
    if ($v && $e) {
      $v.toggleClass('hide')
      $e.toggleClass('hide')
    }
  }

  onSubmitEditPriority (e, priority) {
    e.preventDefault()

    const $form = $(e.target)
    if (!$form.isValid(null, null, false)) return true

    const id = priority.get('_id')
    const name = e.target.name.value
    const overdueIn = e.target.overdueIn.value
    const htmlColor = e.target.htmlColor.value

    const self = this

    api.tickets
      .updatePriority({ id, name, overdueIn, htmlColor })
      .then(res => {
        Log.debug(res)
        self.toggleEditPriority()
        this.props.fetchSettings()
      })
      .catch(err => {
        if (!err.response) {
          Log.error(err)
          return
        }

        const errorText = err.response.data.error
        Log.error(errorText, err.response)
        helpers.UI.showSnackbar(`Error: ${errorText}`, true)
      })
  }

  render () {
    const { priority } = this.props
    return (
      <div className='edit-priority hide' style={{ paddingTop: '2px' }} ref={i => (this.editPriorityRef = i)}>
        <form onSubmit={e => this.onSubmitEditPriority(e, priority)}>
          <div className='uk-grid uk-grid-collapse uk-clearfix'>
            <div className='uk-width-1-4'>
              <label>Имя приоритета</label>
              <input name={'name'} type='text' className={'md-input'} defaultValue={priority.get('name')} />
            </div>
            <div className='uk-width-1-4 uk-padding-small-sides'>
              <label>Просрочка SLA (в минутах)</label>
              <input name={'overdueIn'} type='text' className={'md-input'} defaultValue={priority.get('overdueIn')} />
            </div>
            <div className='uk-width-1-4 uk-padding-small-sides'>
              <ColorSelector
                inputName={'htmlColor'}
                defaultColor={priority.get('htmlColor')}
                hideRevert={true}
                validationEnabled={true}
              />
            </div>
            <div className='uk-width-1-4'>
              <div className='md-btn-group uk-float-right uk-text-right mt-5'>
                <Button small={true} text={'Отмена'} onClick={() => this.toggleEditPriority()} />
                <Button text={'Сохранить'} small={true} style={'success'} type={'submit'} />
              </div>
            </div>
          </div>
        </form>
      </div>
    )
  }
}

EditPriorityPartial.propTypes = {
  priority: PropTypes.object.isRequired,
  fetchSettings: PropTypes.func.isRequired
}

export default connect(
  null,
  { fetchSettings }
)(EditPriorityPartial)
