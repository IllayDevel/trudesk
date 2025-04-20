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
class ServerSettingsController extends React.Component {
  @observable maintenanceModeEnabled = false

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
      if (this.maintenanceModeEnabled !== this.getSetting('maintenanceMode'))
        this.maintenanceModeEnabled = this.getSetting('maintenanceMode')
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
        Log.error('Невозможно перезапустить сервер. Сервер должен работать под PM2, а учетная запись должна иметь права администратора..')
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

  onMaintenanceModeChange (e) {
    const self = this
    const val = e.target.checked

    if (val === true) {
      UIKit.modal.confirm(
        `<h2>Вы уверены?</h2>
        <p style="font-size: 15px;">
            <span class="uk-text-danger" style="font-size: 15px;">Это приведет к принудительному выходу из системы всех пользователей и не позволит войти в систему лицам, не являющимся администраторами.</span> 
        </p>
        `,
        () => {
          this.props
            .updateSetting({
              name: 'maintenanceMode:enable',
              value: val,
              stateName: 'maintenanceMode',
              noSnackbar: true
            })
            .then(() => {
              self.maintenanceModeEnabled = val
            })
        },
        {
          labels: { Ok: 'Да', Cancel: 'Нет' },
          confirmButtonClass: 'md-btn-danger'
        }
      )
    } else {
      this.props
        .updateSetting({ name: 'maintenanceMode:enable', value: val, stateName: 'maintenanceMode', noSnackbar: true })
        .then(() => {
          self.maintenanceModeEnabled = val
        })
    }
  }

  render () {
    const { active } = this.props
    return (
      <div className={active ? 'active' : 'hide'}>
        <SettingItem
          title={'Перезапустить сервер'}
          subtitle={'Перезапустите экземпляр Trudesk. '}
          component={
            <Button
              text={'Перезапустить'}
              flat={false}
              waves={true}
              style={'danger'}
              extraClass={'right mt-8 mr-5'}
              onClick={this.restartServer}
              disabled={this.state.restarting}
            />
          }
        />
        <SettingItem
          title={'Режим обслуживания'}
          subtitle={'Вход разрешен только администраторам.'}
          component={
            <EnableSwitch
              stateName={'maintenanceMode'}
              label={'Включить'}
              checked={this.maintenanceModeEnabled}
              onChange={e => this.onMaintenanceModeChange(e)}
            />
          }
        />
      </div>
    )
  }
}

ServerSettingsController.propTypes = {
  active: PropTypes.bool.isRequired,
  updateSetting: PropTypes.func.isRequired,
  updateMultipleSettings: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
  settings: state.settings.settings
})

export default connect(mapStateToProps, { updateSetting, updateMultipleSettings })(ServerSettingsController)
