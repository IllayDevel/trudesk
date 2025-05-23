import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import BaseModal from './BaseModal'
import Button from 'components/Button'

import { createTag } from 'actions/tickets'

class CreateTagModal extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      name: ''
    }
  }

  onNameChange (e) {
    this.setState({
      name: e.target.value
    })
  }

  onSubmit (e) {
    e.preventDefault()
    if (this.props.page === 'settings')
      return this.props.createTag({ name: this.state.name, currentPage: this.props.currentPage })

    this.props.createTag({ name: this.state.name })
  }

  render () {
    return (
      <BaseModal>
        <form className='uk-form-stacked' onSubmit={e => this.onSubmit(e)}>
          <div>
            <h2 className={'nomargin mb-5'}>Создание тэга</h2>
            <p className='uk-text-muted'>Теги классифицируют тикеты, что упрощает выявление проблем</p>

            <label>Имя тэга</label>
            <input
              type='text'
              className={'md-input'}
              name={'name'}
              data-validation='length'
              data-validation-length='min2'
              data-validation-error-msg='Пожалуйста введите имя тэга. Имя тэга должно содержать не менее 2 символов.'
              value={this.state.name}
              onChange={e => this.onNameChange(e)}
            />
          </div>
          <div className='uk-modal-footer uk-text-right'>
            <Button text={'Закрыть'} extraClass={'uk-modal-close'} flat={true} waves={true} />
            <Button text={'Создать'} type={'submit'} flat={true} waves={true} style={'success'} />
          </div>
        </form>
      </BaseModal>
    )
  }
}

CreateTagModal.propTypes = {
  createTag: PropTypes.func.isRequired,
  page: PropTypes.string,
  currentPage: PropTypes.number
}

export default connect(
  null,
  { createTag }
)(CreateTagModal)
