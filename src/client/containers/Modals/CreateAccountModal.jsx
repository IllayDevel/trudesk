import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { observer } from 'mobx-react'
import { makeObservable, observable } from 'mobx'

import { createAccount } from 'actions/accounts'
import { fetchGroups, unloadGroups } from 'actions/groups'
import { fetchTeams, unloadTeams } from 'actions/teams'
import { fetchRoles } from 'actions/common'

import BaseModal from './BaseModal'
import Button from 'components/Button'
import SingleSelect from 'components/SingleSelect'
import MultiSelect from 'components/MultiSelect'

import $ from 'jquery'
import helpers from 'lib/helpers'

@observer
class CreateAccountModal extends React.Component {
  @observable username = ''
  @observable password = ''
  @observable passwordConfirm = ''
  @observable fullname = ''
  @observable email = ''
  @observable title = ''
  selectedRole = ''
  @observable isAgentRole = false

  constructor (props) {
    super(props)
    makeObservable(this)
  }

  componentDidMount () {
    this.props.fetchGroups({ type: 'all' })
    this.props.fetchTeams()
    this.props.fetchRoles()

    helpers.UI.inputs()
    helpers.formvalidator()
  }

  componentDidUpdate () {
    helpers.UI.reRenderInputs()
  }

  onInputChanged (e, name) {
    this[name] = e.target.value
  }

  onRoleSelectChange (e) {
    this.selectedRole = e.target.value

    const roleObject = this.props.roles.find(role => {
      return role.get('_id') === this.selectedRole
    })

    this.isAgentRole = roleObject.get('isAdmin') || roleObject.get('isAgent')

    if (!this.selectedRole || this.selectedRole.length < 1) this.roleSelectErrorMessage.classList.remove('hide')
    else this.roleSelectErrorMessage.classList.add('hide')
  }

  onGroupSelectChange () {
    const selectedGroups = this.groupSelect.getSelected()
    if (!selectedGroups || selectedGroups.length < 1) this.groupSelectErrorMessage.classList.remove('hide')
    else this.groupSelectErrorMessage.classList.add('hide')
  }

  onFormSubmit (e) {
    e.preventDefault()
    const $form = $(e.target)

    let isValid = true

    if (!$form.isValid(null, null, false)) isValid = false

    if (!this.selectedRole || this.selectedRole.length < 1) {
      this.roleSelectErrorMessage.classList.remove('hide')
      if (isValid) isValid = false
    } else this.roleSelectErrorMessage.classList.add('hide')

    const selectedGroups = this.groupSelect ? this.groupSelect.getSelected() : undefined
    if (selectedGroups) {
      if (selectedGroups.length < 1) {
        this.groupSelectErrorMessage.classList.remove('hide')
        if (isValid) isValid = false
      } else this.groupSelectErrorMessage.classList.add('hide')
    }

    if (!isValid) return

    const payload = {
      username: this.username,
      fullname: this.fullname,
      title: this.title,
      email: this.email,
      groups: this.groupSelect ? this.groupSelect.getSelected() : undefined,
      teams: this.teamSelect ? this.teamSelect.getSelected() : undefined,
      role: this.selectedRole,
      password: this.password.length > 3 ? this.password : undefined,
      passwordConfirm: this.passwordConfirm.length > 3 ? this.passwordConfirm : undefined
    }

    this.props.createAccount(payload)
  }

  render () {
    const roles = this.props.roles
      .map(role => {
        return { text: role.get('name'), value: role.get('_id') }
      })
      .toArray()

    const groups = this.props.groups
      .map(group => {
        return { text: group.get('name'), value: group.get('_id') }
      })
      .toArray()

    const teams = this.props.teams
      .map(team => {
        return { text: team.get('name'), value: team.get('_id') }
      })
      .toArray()

    return (
      <BaseModal parentExtraClass={'pt-0'} extraClass={'p-0 pb-25'}>
        <div className='user-heading' style={{ minHeight: '130px', background: '#1976d2', padding: '24px' }}>
          <div className='uk-width-1-1'>
            <div style={{ width: '82px', height: '82px', float: 'left', marginRight: '24px', position: 'relative' }}>
              <div className='mediumProfilePic' style={{ position: 'relative' }}>
                <img src={`/uploads/users/defaultProfile.jpg`} alt='Аватара' />
              </div>
            </div>
            <div className='user-heading-content'>
              <h2>
                <span className={'uk-text-truncate'}>Создать пользователя</span>
                <span className='sub-heading'>Укажите данные пользователя ниже</span>
              </h2>
            </div>
          </div>
        </div>
        <div style={{ margin: '24px 24px 0 24px' }}>
          <form className='uk-form-stacked' onSubmit={e => this.onFormSubmit(e)}>
            <div className='uk-margin-medium-bottom'>
              <label className='uk-form-label'>Логин</label>
              <input
                type='text'
                className={'md-input'}
                value={this.username}
                onChange={e => this.onInputChanged(e, 'username')}
                data-validation={'length'}
                data-validation-length={'min4'}
                data-validation-error-msg={'Имя пользователя должно содержать не менее 4 символов.'}
              />
            </div>
            <div className='uk-margin-medium-bottom uk-clearfix'>
              <div className='uk-float-left' style={{ width: '50%', paddingRight: '20px' }}>
                <label className={'uk-form-label'}>Имя</label>
                <input
                  type='text'
                  className={'md-input'}
                  value={this.fullname}
                  onChange={e => this.onInputChanged(e, 'fullname')}
                  data-validation={'length'}
                  data-validation-length={'min1'}
                  data-validation-error-msg={'Имя должно содержать не менее 1 символа.'}
                />
              </div>
              <div className='uk-float-left uk-width-1-2'>
                <label className={'uk-form-label'}>Фамилия</label>
                <input
                  type='text'
                  className={'md-input'}
                  value={this.title}
                  onChange={e => this.onInputChanged(e, 'title')}
                />
              </div>
            </div>
            <div className='uk-margin-medium-bottom uk-clearfix'>
              <div className='uk-float-left' style={{ width: '50%', paddingRight: '20px' }}>
                <label className={'uk-form-label'}>Пароль</label>
                <input
                  type='password'
                  className={'md-input'}
                  name={'password_confirmation'}
                  value={this.password}
                  onChange={e => this.onInputChanged(e, 'password')}
                />
              </div>
              <div className='uk-float-left uk-width-1-2'>
                <label className={'uk-form-label'}>Подтверждение пароля</label>
                <input
                  type='password'
                  className={'md-input'}
                  name={'password'}
                  value={this.passwordConfirm}
                  onChange={e => this.onInputChanged(e, 'passwordConfirm')}
                  data-validation='confirmation'
                  data-validation-error-msg={'Пароли не совпадают'}
                />
              </div>
            </div>
            <div className='uk-margin-medium-bottom'>
              <label className='uk-form-label'>Email</label>
              <input
                type='email'
                className={'md-input'}
                value={this.email}
                onChange={e => this.onInputChanged(e, 'email')}
                data-validation='email'
              />
            </div>
            <div className='uk-margin-medium-bottom'>
              <label className={'uk-form-label'}>Роль</label>
              <SingleSelect
                items={roles}
                width={'100'}
                showTextbox={false}
                onSelectChange={e => this.onRoleSelectChange(e)}
              />
              <span
                className='hide help-block'
                style={{ display: 'inline-block', marginTop: '10px', fontWeight: 'bold', color: '#d85030' }}
                ref={r => (this.roleSelectErrorMessage = r)}
              >
                Выберите роль пользователя
              </span>
            </div>
            {!this.isAgentRole && (
              <div>
                <div className='uk-margin-medium-bottom'>
                  <label className='uk-form-label'>Группы</label>
                  <MultiSelect
                    items={groups}
                    onChange={e => this.onGroupSelectChange(e)}
                    ref={r => (this.groupSelect = r)}
                  />
                  <span
                    className={'hide help-block'}
                    style={{ display: 'inline-block', marginTop: '3px', fontWeight: 'bold', color: '#d85030' }}
                    ref={r => (this.groupSelectErrorMessage = r)}
                  >
                    Выберите группы пользователя.
                  </span>
                </div>
              </div>
            )}
            {this.isAgentRole && (
              <div>
                <div className='uk-margin-medium-bottom'>
                  <label className='uk-form-label'>Команды</label>
                  <MultiSelect items={teams} onChange={() => {}} ref={r => (this.teamSelect = r)} />
                </div>
              </div>
            )}
            <div className='uk-modal-footer uk-text-right'>
              <Button text={'Закрыть'} flat={true} waves={true} extraClass={'uk-modal-close'} />
              <Button text={'Создать пользователя'} flat={true} waves={true} style={'success'} type={'submit'} />
            </div>
          </form>
        </div>
      </BaseModal>
    )
  }
}

CreateAccountModal.propTypes = {
  common: PropTypes.object.isRequired,
  groups: PropTypes.object.isRequired,
  teams: PropTypes.object.isRequired,
  roles: PropTypes.object.isRequired,
  createAccount: PropTypes.func.isRequired,
  fetchGroups: PropTypes.func.isRequired,
  unloadGroups: PropTypes.func.isRequired,
  fetchTeams: PropTypes.func.isRequired,
  unloadTeams: PropTypes.func.isRequired,
  fetchRoles: PropTypes.func.isRequired
}

const mapStateToProps = state => ({
  roles: state.shared.roles,
  common: state.common,
  groups: state.groupsState.groups,
  teams: state.teamsState.teams
})

export default connect(mapStateToProps, {
  createAccount,
  fetchGroups,
  unloadGroups,
  fetchTeams,
  unloadTeams,
  fetchRoles
})(CreateAccountModal)
