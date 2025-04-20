import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import BaseModal from './BaseModal'
import Button from 'components/Button'

import { hideModal } from 'actions/common'

class LinkWarningModal extends React.Component {
  proceedToLink = (e, link) => {
    e.preventDefault()
    this.props.hideModal()
    setTimeout(() => {
      window.open(link, '_blank')
    }, 300)
  }

  render () {
    return (
      <BaseModal>
        <div>
          <h2>Предупреждение о перенаправлении</h2>
          <p>Вы будите перенаправлены на сайт за пределами этого домена. Действуйте с осторожностью.</p>
          <p>
            <strong>{this.props.href}</strong>
          </p>
        </div>
        <div className='uk-modal-footer uk-text-right'>
          <Button text={'Cancel'} extraClass={'uk-modal-close'} flat={true} waves={true} />
          <Button
            text={'Продолжить'}
            type={'submit'}
            flat={true}
            waves={true}
            style={'danger'}
            onClick={e => this.proceedToLink(e, this.props.href)}
          />
        </div>
      </BaseModal>
    )
  }
}

LinkWarningModal.propTypes = {
  hideModal: PropTypes.func.isRequired,
  href: PropTypes.string.isRequired
}

export default connect(null, { hideModal })(LinkWarningModal)
