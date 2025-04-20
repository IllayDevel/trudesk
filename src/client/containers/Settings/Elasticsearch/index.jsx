import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { observer } from 'mobx-react'
import { makeObservable, observable } from 'mobx'
import { updateSetting, updateMultipleSettings } from 'actions/settings'

import Button from 'components/Button'
import SettingItem from 'components/Settings/SettingItem'
import EnableSwitch from 'components/Settings/EnableSwitch'

import Log from '../../../logger'
import axios from 'axios'
import helpers from 'lib/helpers'
import UIKit from 'uikit'

@observer
class ElasticsearchSettingsContainer extends React.Component {
  @observable esStatus = 'Не настроен'
  @observable esStatusClass = ''
  @observable indexCount = 0
  @observable inSyncText = 'Не настроен'
  @observable inSyncClass = ''
  @observable disableRebuild = false

  constructor (props) {
    super(props)
    makeObservable(this)

    this.state = {
      host: false,
      port: '',

      configured: false
    }

    this.getStatus = this.getStatus.bind(this)
    this.rebuildIndex = this.rebuildIndex.bind(this)
  }

  componentDidMount () {
    helpers.UI.inputs()
  }

  componentDidUpdate () {
    helpers.UI.reRenderInputs()

    if (!this.loaded && this.state.configured) {
      this.getStatus()
      this.loaded = true
    }
  }

  static getDerivedStateFromProps (nextProps, state) {
    if (nextProps.settings) {
      let stateObj = { ...state }
      if (state.host === false)
        stateObj.host = nextProps.settings.getIn(['settings', 'elasticSearchHost', 'value']) || false
      if (!state.port) stateObj.port = nextProps.settings.getIn(['settings', 'elasticSearchPort', 'value']) || ''

      if (!state.configured)
        stateObj.configured = nextProps.settings.getIn(['settings', 'elasticSearchConfigured', 'value']) || false

      return stateObj
    }

    return null
  }

  getSetting (name) {
    return this.props.settings.getIn(['settings', name, 'value'])
      ? this.props.settings.getIn(['settings', name, 'value'])
      : ''
  }

  onEnableChanged (e) {
    const checked = e.target.checked
    const self = this
    this.props
      .updateSetting({
        stateName: 'elasticSearchEnabled',
        name: 'es:enable',
        value: checked,
        noSnackbar: true
      })
      .then(() => {
        if (checked && this.state.host && this.state.port) {
          this.setState({ configured: true }, () => {
            this.getStatus()
          })
        } else {
          this.setState({ configured: false }, () => {
            self.esStatus = 'Not Configured'
            self.esStatusClass = ''
            self.inSyncText = 'Не настроен'
            self.inSyncClass = ''
            self.indexCount = 0
          })
        }
      })
  }

  onInputChanged (e, settingName) {
    this.setState({
      [settingName]: e.target.value
    })
  }

  onFormSubmit (e) {
    e.preventDefault()

    const payload = [
      { name: 'es:host', value: this.state.host },
      { name: 'es:port', value: this.state.port }
    ]

    this.props.updateMultipleSettings(payload)
  }

  getStatus () {
    const self = this
    // self.esStatus = 'Please Wait...'
    // self.inSyncText = 'Please Wait...'
    // if (!this.state.configured) {
    //   this.esStatus = 'Not Configured'
    //   this.indexCount = 0
    //   this.inSyncText = 'Not Configured'
    //   this.inSyncClass = ''
    //
    //   return false
    // }

    axios
      .get('/api/v2/es/status')
      .then(res => {
        const data = res.data
        if (data.status.isRebuilding) {
          self.esStatus = 'Восстановление...'
          self.esStatusClass = ''
        } else self.esStatus = data.status.esStatus
        if (self.esStatus.toLowerCase() === 'connected') self.esStatusClass = 'text-success'
        else if (self.esStatus.toLowerCase() === 'error') self.esStatusClass = 'text-danger'

        self.indexCount = data.status.indexCount.toLocaleString()
        if (data.status.inSync) {
          self.inSyncText = 'Синхронизирован'
          self.inSyncClass = 'bg-success'
        } else {
          self.inSyncText = 'Не синхронизировано'
          self.inSyncClass = 'bg-warn'
        }

        if (data.status.isRebuilding) {
          setTimeout(self.getStatus, 3000)
          self.disableRebuild = true
        } else self.disableRebuild = false
      })
      .catch(err => {
        this.esStatus = 'Error'
        this.esStatusClass = 'text-danger'
        this.inSyncText = 'Неизвестен'
        this.inSyncClass = ''
        if (err.error && err.error.message) helpers.UI.showSnackbar('Ошибка: ' + err.error.message, true)
        else helpers.UI.showSnackbar('Ошибка: Произошла неизвестная ошибка. Проверьте консоль.', true)
        Log.error(err)
      })
  }

  rebuildIndex () {
    const self = this
    UIKit.modal.confirm(
      'Вы уверены, что хотите перестроить индекс?',
      function () {
        self.esStatus = 'Восстановление...'
        self.inSyncText = 'Не синхронизировано'
        self.inSyncClass = 'bg-warn'
        self.indexCount = 0
        axios
          .get('/api/v2/es/rebuild')
          .then(() => {
            self.esStatus = 'Восстановление...'
            // $scope.esStatusClass = 'text-warning';
            helpers.UI.showSnackbar('Восстановление индекса...', false)
            self.disableRebuild = true
            setTimeout(self.getStatus, 3000)
          })
          .catch(function (err) {
            Log.error('[trudesk:settings:es:RebuildIndex]', err)
            helpers.UI.showSnackbar('Ошибка: Произошла неизвестная ошибка. Проверьте консоль.', true)
          })
      },
      {
        labels: { Ok: 'Да', Cancel: 'Нет' },
        confirmButtonClass: 'md-btn-danger'
      }
    )
  }

  render () {
    return (
      <div className={this.props.active ? '' : 'hide'}>
        <SettingItem
          title={'Elasticsearch'}
          subtitle={'Включить поисковую систему Elasticsearch'}
          component={
            <EnableSwitch
              stateName={'elasticSearchEnabled'}
              label={'Включить'}
              checked={this.getSetting('elasticSearchEnabled')}
              onChange={e => this.onEnableChanged(e)}
            />
          }
        />
        <SettingItem
          title={'Статус соединения'}
          subtitle={'Текущее состояние подключения к серверу Elasticsearch.'}
          component={<h4 className={`right mr-15 mt-15 ${this.esStatusClass}`}>{this.esStatus}</h4>}
        />
        <SettingItem
          title={'Проиндексированные документы'}
          subtitle={'Текущее количество проиндексированных документов.'}
          component={<h4 className={'right mr-15 mt-15'}>{this.indexCount}</h4>}
        />
        <SettingItem
          title={'Статус индекса'}
          subtitle={'Текущее состояние индекса. Если состояние не зеленый, возможно, индекс нуждается в перестройке.'}
          extraClass={this.inSyncClass}
          component={<h4 className={'right mr-15 mt-15'}>{this.inSyncText}</h4>}
        />
        <SettingItem
          title={'Конфигурация сервера Elasticsearch'}
          tooltip={'Изменение настроек сервера потребует перестроения индекса и перезапуска сервера..'}
          subtitle={'Настройки подключения к серверу Elasticsearch.'}
        >
          <form onSubmit={e => this.onFormSubmit(e)}>
            <div className='uk-margin-medium-bottom'>
              <label>Сервер</label>
              <input
                type='text'
                className={'md-input md-input-width-medium'}
                value={this.state.host}
                disabled={!this.getSetting('elasticSearchEnabled')}
                onChange={e => this.onInputChanged(e, 'host')}
              />
            </div>
            <div className='uk-margin-medium-bottom'>
              <label>Порт</label>
              <input
                type='text'
                className={'md-input md-input-width-medium'}
                value={this.state.port}
                disabled={!this.getSetting('elasticSearchEnabled')}
                onChange={e => this.onInputChanged(e, 'port')}
              />
            </div>
            <div className='uk-clearfix'>
              <Button
                text={'Применить'}
                type={'submit'}
                flat={true}
                waves={true}
                disabled={!this.getSetting('elasticSearchEnabled')}
                style={'success'}
                extraClass={'uk-float-right'}
              />
            </div>
          </form>
        </SettingItem>
        <SettingItem
          title={'Восстановить индекс'}
          subtitle={'Очистить индекс и перестроить'}
          tooltip={
            'Перестроение индекса должно происходить только в том случае, если индекс не синхронизирован с базой данных или не был инициализирован. Перестроение займет некоторое время.'
          }
          component={
            <Button
              text={'Восстановить'}
              flat={false}
              waves={true}
              style={'primary'}
              extraClass={'right mt-8 mr-5'}
              disabled={this.disableRebuild}
              onClick={this.rebuildIndex}
            />
          }
        />
      </div>
    )
  }
}

ElasticsearchSettingsContainer.propTypes = {
  active: PropTypes.bool.isRequired,
  settings: PropTypes.object.isRequired,
  updateSetting: PropTypes.func.isRequired,
  updateMultipleSettings: PropTypes.func.isRequired
}

const mapStateToProps = state => ({
  settings: state.settings.settings
})

export default connect(mapStateToProps, { updateSetting, updateMultipleSettings })(ElasticsearchSettingsContainer)
