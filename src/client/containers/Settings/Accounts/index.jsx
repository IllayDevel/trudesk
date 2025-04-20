import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { updateSetting, updateMultipleSettings } from 'actions/settings'

import Button from 'components/Button'
import SettingItem from 'components/Settings/SettingItem'

import helpers from 'lib/helpers'
import axios from 'axios'
import Log from '../../../logger'
import EnableSwitch from 'components/Settings/EnableSwitch'
import { observer } from 'mobx-react'
import { makeObservable, observable } from 'mobx'
import UIKit from 'uikit'

@observer
class AccountsSettingsContainer extends React.Component {
  @observable passwordComplexityEnabled = false
  @observable allowUserRegistrationEnabled = false

  constructor (props) {
    super(props)

    makeObservable(this)

    this.state = {
      restarting: false
    }

    this.restartServer = this.restartServer.bind(this)
  }

  componentDidMount () {
    // helpers.UI.inputs()
  }

  componentDidUpdate (prevProps) {
    // helpers.UI.reRenderInputs()
    if (prevProps.settings !== this.props.settings) {
      if (this.passwordComplexityEnabled !== this.getSetting('accountsPasswordComplexity'))
        this.passwordComplexityEnabled = this.getSetting('accountsPasswordComplexity')
      if (this.allowUserRegistrationEnabled !== this.getSetting('allowUserRegistration'))
        this.allowUserRegistrationEnabled = this.getSetting('allowUserRegistration')
    }
  }

  restartServer () {
    this.setState({ restarting: true })

    const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content')
    axios
      .post(
        '/api/v1/admin/restart',
        {},
        {
          headers: {
            'CSRF-TOKEN': token
          }
        }
      )
      .catch(error => {
        helpers.hideLoader()
        Log.error(error.responseText)
        Log.error('Невозможно перезапустить сервер. Сервер должен работать под управлением PM2, а учетная запись должна иметь права администратора.')
        helpers.UI.showSnackbar('Невозможно перезапустить сервер. Вы администратор?', true)
      })
      .then(() => {
        this.setState({ restarting: false })
      })
  }

  getSetting (stateName) {
    return this.props.settings.getIn(['settings', stateName, 'value'])
      ? this.props.settings.getIn(['settings', stateName, 'value'])
      : ''
  }

  updateSetting (stateName, name, value) {
    this.props.updateSetting({ stateName, name, value })
  }

  render () {
    const { active } = this.props
    return (
      <div className={active ? 'active' : 'hide'}>
        <SettingItem
          title='Разрешить регистрацию пользователей'
          subtitle='Разрешить пользователям создавать учетные записи на экране входа в систему.'
          component={
            <EnableSwitch
              stateName='allowUserRegistration'
              label='Включить'
              checked={this.allowUserRegistrationEnabled}
              onChange={e => {
                this.updateSetting('allowUserRegistration', 'allowUserRegistration:enable', e.target.checked)
              }}
            />
          }
        />
        <SettingItem
          title={'Сложность пароля'}
          subtitle={'Требовать от паролей пользователей соответствия минимальной сложности пароля'}
          tooltip={'Минимум 8 символов, включая заглавные буквы и цифры.'}
          component={
            <EnableSwitch
              stateName={'accountsPasswordComplexity'}
              label={'Включить'}
              checked={this.passwordComplexityEnabled}
              onChange={e => {
                this.updateSetting('accountsPasswordComplexity', 'accountsPasswordComplexity:enable', e.target.checked)
              }}
            />
          }
        />
      </div>
    )
  }
}

AccountsSettingsContainer.propTypes = {
  active: PropTypes.bool.isRequired,
  updateSetting: PropTypes.func.isRequired,
  updateMultipleSettings: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
  settings: state.settings.settings
})

export default connect(mapStateToProps, { updateSetting, updateMultipleSettings })(AccountsSettingsContainer)
