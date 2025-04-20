import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { createTicketType } from 'actions/tickets'
import BaseModal from './BaseModal'
import Button from 'components/Button'

import $ from 'jquery'
import helpers from 'lib/helpers'

class CreateTicketTypeModal extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      typeName: ''
    }
  }

  componentDidMount () {
    helpers.UI.inputs()
    helpers.formvalidator()
  }

  onTypeNameChanged (e) {
    this.setState({
      typeName: e.target.value
    })
  }

  onCreateTicketTypeSubmit (e) {
    e.preventDefault()
    const $form = $(e.target)
    if (!$form.isValid(null, null, false)) return true

    //  Form is valid... Submit..
    this.props.createTicketType({ name: this.state.typeName })
  }

  render () {
    return (
      <BaseModal {...this.props} ref={i => (this.base = i)}>
        <form className={'uk-form-stacked'} onSubmit={e => this.onCreateTicketTypeSubmit(e)}>
          <div>
            <h2 className='nomargin mb-5'>Создание типа задачи</h2>
            <p className='uk-text-small uk-text-muted'>Создание типа задачи</p>
            <label htmlFor='typeName'>Имя типа</label>
            <input
              value={this.state.typeName}
              onChange={e => this.onTypeNameChanged(e)}
              type='text'
              className={'md-input'}
              name={'typeName'}
              data-validation='length'
              data-validation-length='min3'
              data-validation-error-msg='Введите правильное имя типа. Имя типа должна быть не менее 3 символов'
            />
          </div>
          <div className='uk-modal-footer uk-text-right'>
            <Button text={'Закрыть'} flat={true} waves={true} extraClass={'uk-modal-close'} />
            <Button text={'Создать'} style={'success'} type={'submit'} />
          </div>
        </form>
      </BaseModal>
    )
  }
}

CreateTicketTypeModal.propTypes = {
  onTypeCreated: PropTypes.func,
  createTicketType: PropTypes.func.isRequired
}

export default connect(
  null,
  { createTicketType }
)(CreateTicketTypeModal)
