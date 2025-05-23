import React from 'react'
import PropTypes from 'prop-types'
import { makeObservable, observable } from 'mobx'
import { observer } from 'mobx-react'
import { connect } from 'react-redux'

import { fetchAccounts, unloadAccounts } from 'actions/accounts'
import { createTeam } from 'actions/teams'

import BaseModal from 'containers/Modals/BaseModal'

import helpers from 'lib/helpers'
import $ from 'jquery'
import Button from 'components/Button'
import MultiSelect from 'components/MultiSelect'

@observer
class CreateTeamModal extends React.Component {
  @observable name = ''

  constructor (props) {
    super(props)
    makeObservable(this)
  }

  componentDidMount () {
    this.props.fetchAccounts({ limit: -1 })

    helpers.UI.inputs()
    helpers.UI.reRenderInputs()
    helpers.formvalidator()
  }

  componentDidUpdate () {
    helpers.UI.reRenderInputs()
  }

  componentWillUnmount () {
    this.props.unloadAccounts()
  }

  onInputChange (e) {
    this.name = e.target.value
  }

  onFormSubmit (e) {
    e.preventDefault()
    const $form = $(e.target)
    if (!$form.isValid(null, null, false)) return false

    const payload = {
      name: this.name,
      members: this.membersSelect.getSelected()
    }

    this.props.createTeam(payload)
  }

  render () {
    const mappedAccounts = this.props.accounts
      .filter(account => {
        return account.getIn(['role', 'isAgent']) === true && !account.get('deleted')
      })
      .map(account => {
        return { text: account.get('fullname'), value: account.get('_id') }
      })
      .toArray()

    return (
      <BaseModal {...this.props} options={{ bgclose: false }}>
        <div className={'mb-25'}>
          <h2>Создание команды</h2>
        </div>
        <form className={'uk-form-stacked'} onSubmit={e => this.onFormSubmit(e)}>
          <div className={'uk-margin-medium-bottom'}>
            <label>Имя команды</label>
            <input
              type='text'
              className={'md-input'}
              value={this.name}
              onChange={e => this.onInputChange(e)}
              data-validation='length'
              data-validation-length={'min2'}
              data-validation-error-msg={'Введите имя команды. (Должно содержать не менее 2 символов)'}
            />
          </div>
          <div className={'uk-margin-medium-bottom'}>
            <label style={{ marginBottom: 5 }}>Члены команды</label>
            <MultiSelect items={mappedAccounts} onChange={() => {}} ref={r => (this.membersSelect = r)} />
          </div>
          <div className='uk-modal-footer uk-text-right'>
            <Button text={'Закрыть'} flat={true} waves={true} extraClass={'uk-modal-close'} />
            <Button text={'Создать команду'} flat={true} waves={true} style={'primary'} type={'submit'} />
          </div>
        </form>
      </BaseModal>
    )
  }
}

CreateTeamModal.propTypes = {
  fetchAccounts: PropTypes.func.isRequired,
  unloadAccounts: PropTypes.func.isRequired,
  accounts: PropTypes.object.isRequired,
  createTeam: PropTypes.func.isRequired
}

const mapStateToProps = state => ({
  accounts: state.accountsState.accounts
})

export default connect(mapStateToProps, { fetchAccounts, unloadAccounts, createTeam })(CreateTeamModal)
