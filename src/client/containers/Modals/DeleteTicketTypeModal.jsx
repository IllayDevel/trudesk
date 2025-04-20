import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { deleteTicketType } from 'actions/tickets'
import BaseModal from './BaseModal'
import Button from 'components/Button'
import SingleSelect from 'components/SingleSelect'

import helpers from 'lib/helpers'

class DeleteTicketTypeModal extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      selectedType: ''
    }
  }

  getTicketTypes () {
    return this.props.settings && this.props.settings.get('ticketTypes')
      ? this.props.settings.get('ticketTypes').toArray()
      : []
  }

  onSelectChanged (e) {
    this.setState({
      selectedType: e.target.value
    })
  }

  onFormSubmit (e) {
    e.preventDefault()
    if (!this.state.selectedType) {
      helpers.UI.showSnackbar('Unable to get new ticket type. Aborting...', true)
      return true
    }

    this.props.deleteTicketType(this.props.type.get('_id'), this.state.selectedType)
  }

  render () {
    const { type } = this.props
    const mappedTypes = this.getTicketTypes()
      .filter(obj => {
        return type.get('name') !== obj.get('name')
      })
      .map(item => {
        return { text: item.get('name'), value: item.get('_id') }
      })
    return (
      <BaseModal {...this.props} options={{ bgclose: false }}>
        <form className={'uk-form-stacked'} onSubmit={e => this.onFormSubmit(e)}>
          <div className='uk-margin-medium-bottom uk-clearfix'>
            <h2>Удаления типа задачи</h2>
            <span>
              Пожалуйста, выберите тип задачи, на который вы хотите переназначить задачи, чтобы удалить этот тип задачи.
            </span>
            {/*<hr style={{ margin: '10px 0' }} />*/}
          </div>
          <div className='uk-margin-medium-bottom uk-clearfix'>
            <div className='uk-float-left' style={{ width: '100%' }}>
              <label className={'uk-form-label nopadding nomargin'}>Type</label>
              <SingleSelect
                showTextbox={false}
                items={mappedTypes}
                onSelectChange={e => this.onSelectChanged(e)}
                value={this.state.selectedType}
              />
            </div>
          </div>
          <div className='uk-margin-medium-bottom uk-clearfix'>
            <span className='uk-text-danger'>
              ВНИМАНИЕ: Это изменит все задачи с типом <strong>{type.get('name')}</strong>к выбранному типу задачи.
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

DeleteTicketTypeModal.propTypes = {
  type: PropTypes.object.isRequired,
  settings: PropTypes.object.isRequired,
  deleteTicketType: PropTypes.func.isRequired
}

const mapStateToProps = state => ({
  settings: state.settings.settings
})

export default connect(
  mapStateToProps,
  { deleteTicketType }
)(DeleteTicketTypeModal)
