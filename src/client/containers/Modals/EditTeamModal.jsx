import React from 'react'
import PropTypes from 'prop-types'
import { makeObservable, observable } from 'mobx'
import { observer } from 'mobx-react'
import { connect } from 'react-redux'

import { fetchAccounts, unloadAccounts } from 'actions/accounts'
import { saveEditTeam } from 'actions/teams'

import BaseModal from 'containers/Modals/BaseModal'

import helpers from 'lib/helpers'
import Button from 'components/Button'
import MultiSelect from 'components/MultiSelect'
import $ from 'jquery'
import SpinLoader from 'components/SpinLoader'

@observer
class EditTeamModal extends React.Component {
  @observable name = ''

  constructor (props) {
    super(props)
    makeObservable(this)
  }

  componentDidMount () {
    this.props.fetchAccounts({ type: 'all', limit: -1 })
    this.name = this.props.team.name

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

  onSaveTeamEdit (e) {
    e.preventDefault()
    const $form = $(e.target)
    if (!$form.isValid(null, null, false)) return false

    const payload = {
      _id: this.props.team._id,
      name: this.name,
      members: this.membersSelect.getSelected() || []
    }

    this.props.saveEditTeam(payload)
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

    const selectedMembers = this.props.team.members

    return (
      <BaseModal {...this.props} options={{ bgclose: false }}>
        <SpinLoader active={this.props.accountsLoading} />
        <div className={'mb-25'}>
          <h2>Редактирование команды</h2>
        </div>
        <form className={'uk-form-stacked'} onSubmit={e => this.onSaveTeamEdit(e)}>
          <div className={'uk-margin-medium-bottom'}>
            <label>Имя команды</label>
            <input
              type='text'
              className={'md-input'}
              value={this.name}
              onChange={e => this.onInputChange(e)}
              data-validation='length'
              data-validation-length={'2-25'}
              data-validation-error-msg={'Введите правильное имя команды. (Имя должно быть не менее 2 символов)'}
            />
          </div>
          <div className={'uk-margin-medium-bottom'}>
            <label style={{ marginBottom: 5 }}>Челны команды</label>
            <MultiSelect
              items={mappedAccounts}
              initialSelected={selectedMembers}
              onChange={() => {}}
              ref={r => (this.membersSelect = r)}
            />
          </div>
          <div className='uk-modal-footer uk-text-right'>
            <Button text={'Закрыть'} flat={true} waves={true} extraClass={'uk-modal-close'} />
            <Button text={'Сохранить команду'} flat={true} waves={true} style={'primary'} type={'submit'} />
          </div>
        </form>
      </BaseModal>
    )
  }
}

EditTeamModal.propTypes = {
  team: PropTypes.object.isRequired,
  fetchAccounts: PropTypes.func.isRequired,
  unloadAccounts: PropTypes.func.isRequired,
  saveEditTeam: PropTypes.func.isRequired,
  accounts: PropTypes.object.isRequired,
  accountsLoading: PropTypes.bool.isRequired
}

const mapStateToProps = state => ({
  accounts: state.accountsState.accounts,
  accountsLoading: state.accountsState.loading
})

export default connect(mapStateToProps, { fetchAccounts, unloadAccounts, saveEditTeam })(EditTeamModal)
