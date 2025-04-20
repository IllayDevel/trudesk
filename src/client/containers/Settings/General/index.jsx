import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import moment from 'moment-timezone'
import { updateSetting } from 'actions/settings'

import SettingItem from 'components/Settings/SettingItem'

import InputWithSave from 'components/Settings/InputWithSave'
import SingleSelect from 'components/SingleSelect'
import EnableSwitch from 'components/Settings/EnableSwitch'
import SettingSubItem from 'components/Settings/SettingSubItem'
import Zone from 'components/ZoneBox/zone'
import ZoneBox from 'components/ZoneBox'

class GeneralSettings extends React.Component {
  constructor (props) {
    super(props)
  }

  componentDidMount () {}
  componentWillUnmount () {}

  getSettingsValue (name) {
    return this.props.settings.getIn(['settings', name, 'value'])
      ? this.props.settings.getIn(['settings', name, 'value'])
      : ''
  }

  updateSetting (stateName, name, value) {
    this.props.updateSetting({ stateName, name, value })
  }

  getTimezones () {
    return moment.tz
      .names()
      .map(function (name) {
        const year = new Date().getUTCFullYear()
        const timezoneAtBeginningOfyear = moment.tz(year + '-01-01', name)
        return {
          utc: timezoneAtBeginningOfyear.utcOffset(),
          text: '(GMT' + timezoneAtBeginningOfyear.format('Z') + ') ' + name,
          value: name
        }
      })
      .sort(function (a, b) {
        return a.utc - b.utc
      })
  }

  onTimezoneChange (e) {
    if (e.target.value) this.updateSetting('timezone', 'gen:timezone', e.target.value)
  }

  render () {
    const { active } = this.props

    const SiteTitle = (
      <InputWithSave
        stateName='siteTitle'
        settingName='gen:sitetitle'
        initialValue={this.getSettingsValue('siteTitle')}
      />
    )

    const SiteUrl = (
      <InputWithSave stateName='siteUrl' settingName='gen:siteurl' initialValue={this.getSettingsValue('siteUrl')} />
    )

    const Timezone = (
      <SingleSelect
        stateName='timezone'
        settingName='gen:timezone'
        items={this.getTimezones()}
        defaultValue={this.getSettingsValue('timezone')}
        onSelectChange={e => {
          this.onTimezoneChange(e)
        }}
        showTextbox={true}
      />
    )

    return (
      <div className={active ? 'active' : 'hide'}>
        <SettingItem
          title='Имя сайта'
          subtitle={
            <div>
              Название сайта используется как заголовок страницы. <i>по умолчанию: Trudesk</i>
            </div>
          }
          component={SiteTitle}
        />
        <SettingItem
          title='Url сайта'
          subtitle={
            <div>
              Публично доступный URL этого сайта. <i>пример: {this.props.viewdata.get('hosturl')}</i>
            </div>
          }
          component={SiteUrl}
        />
        <SettingItem
          title='Часовой пояс сервера'
          subtitle='Установите часовой пояс локального сервера для отображения точного времени'
          tooltip='Пользователь может переопределить часовой пояс.'
          component={Timezone}
        />
        <SettingItem
          title='Формат даты и времени'
          subtitle={
            <a href='https://momentjs.com/docs/#/displaying/format/' rel='noopener noreferrer' target='_blank'>
             Формат Moment.js
            </a>
          }
        >
          <Zone>
            <ZoneBox>
              <SettingSubItem
                title='Формат времени'
                subtitle='Установить формат отображения времени'
                component={
                  <InputWithSave
                    stateName='timeFormat'
                    settingName='gen:timeFormat'
                    initialValue={this.getSettingsValue('timeFormat')}
                    width={'60%'}
                  />
                }
              />
            </ZoneBox>
            <ZoneBox>
              <SettingSubItem
                title='Короткий формат даты'
                subtitle='Установите формат для коротких дат'
                component={
                  <InputWithSave
                    stateName='shortDateFormat'
                    settingName='gen:shortDateFormat'
                    initialValue={this.getSettingsValue('shortDateFormat')}
                    width={'60%'}
                  />
                }
              />
            </ZoneBox>
            <ZoneBox>
              <SettingSubItem
                title='Длинный формат даты'
                subtitle='Установить формат для длинных дат'
                component={
                  <InputWithSave
                    stateName='longDateFormat'
                    settingName='gen:longDateFormat'
                    initialValue={this.getSettingsValue('longDateFormat')}
                    width={'60%'}
                  />
                }
              />
            </ZoneBox>
          </Zone>
        </SettingItem>
      </div>
    )
  }
}

GeneralSettings.propTypes = {
  active: PropTypes.bool,
  updateSetting: PropTypes.func.isRequired,
  viewdata: PropTypes.object.isRequired,
  settings: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
  viewdata: state.common.viewdata,
  settings: state.settings.settings
})

export default connect(mapStateToProps, { updateSetting })(GeneralSettings)
