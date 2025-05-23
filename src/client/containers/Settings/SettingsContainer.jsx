import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { fetchSettings } from 'actions/settings'

import Menu from 'components/Settings/Menu'
import MenuItem from 'components/Settings/MenuItem'
import GeneralSettings from './General'
import AccountsSettings from './Accounts'
import AppearanceSettings from './Appearance'
import PermissionsSettingsContainer from './Permissions'
import TicketsSettings from './Tickets'
import MailerSettingsContainer from './Mailer'
import ElasticsearchSettingsContainer from './Elasticsearch'
// import TPSSettingsContainer from './TPS'
import BackupRestoreSettingsContainer from './BackupRestore'
import ServerSettingsController from './Server'
import LegalSettingsContainer from 'containers/Settings/Legal'

import helpers from 'lib/helpers'

class SettingsContainer extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      title: 'Настройки',
      activeCategory: 'settings-general'
    }
  }

  componentDidMount () {
    const location = window.location.pathname.replace(/^(\/settings(\/?))/, '')
    if (location) {
      this.setState({
        activeCategory: 'settings-' + location
      })
    }

    this.props.fetchSettings()

    helpers.resizeAll()
  }

  onMenuItemClick (e, category) {
    if (this.state.activeCategory === 'settings-' + category) return

    this.setState(
      {
        activeCategory: 'settings-' + category
      },
      () => {
        if (this.page) this.page.scrollTop = 0
      }
    )
  }

  render () {
    return (
      <div className='uk-grid uk-grid-collapse'>
        <div className='uk-width-1-6 uk-width-xLarge-1-10 message-list full-height' data-offset='68'>
          <div
            className='page-title noshadow nopadding-right'
            style={{ borderTop: 'none', borderBottom: 'none', height: '68px', paddingLeft: '20px' }}
          >
            <div style={{ position: 'relative' }}>
              <p style={{ fontSize: '24px' }}>{this.state.title}</p>
            </div>
          </div>
          <div className='page-content-left noborder full-height'>
            <Menu>
              <MenuItem
                title='Главные'
                active={this.state.activeCategory === 'settings-general'}
                onClick={e => {
                  this.onMenuItemClick(e, 'general')
                }}
              />
              <MenuItem
                title='Пользователи'
                active={this.state.activeCategory === 'settings-accounts'}
                onClick={e => {
                  this.onMenuItemClick(e, 'accounts')
                }}
              />
              <MenuItem
                title='Вид'
                active={this.state.activeCategory === 'settings-appearance'}
                onClick={e => {
                  this.onMenuItemClick(e, 'appearance')
                }}
              />
              <MenuItem
                title='Права'
                active={this.state.activeCategory === 'settings-permissions'}
                onClick={e => {
                  this.onMenuItemClick(e, 'permissions')
                }}
              />
              <MenuItem
                title='Задача'
                active={this.state.activeCategory === 'settings-tickets'}
                onClick={e => {
                  this.onMenuItemClick(e, 'tickets')
                }}
              />
              <MenuItem
                title='Почта'
                active={this.state.activeCategory === 'settings-mailer'}
                onClick={e => {
                  this.onMenuItemClick(e, 'mailer')
                }}
              />
              <MenuItem
                title={'Elasticsearch'}
                active={this.state.activeCategory === 'settings-elasticsearch'}
                onClick={e => {
                  this.onMenuItemClick(e, 'elasticsearch')
                }}
              />
              <MenuItem
                title='Бэкап'
                active={this.state.activeCategory === 'settings-backup'}
                onClick={e => {
                  this.onMenuItemClick(e, 'backup')
                }}
              />
              <MenuItem
                title='Сервер'
                active={this.state.activeCategory === 'settings-server'}
                onClick={e => {
                  this.onMenuItemClick(e, 'server')
                }}
              />
              <MenuItem
                title='Политика'
                active={this.state.activeCategory === 'settings-legal'}
                onClick={e => {
                  this.onMenuItemClick(e, 'legal')
                }}
              />
            </Menu>
          </div>
        </div>
        <div className='uk-width-5-6 uk-width-xLarge-9-10'>
          <div
            className='page-title-right noshadow page-title-border-bottom'
            style={{ borderTop: 'none', height: '69px' }}
          />
          <div className='page-wrapper full-height scrollable no-overflow-x' ref={i => (this.page = i)}>
            <div className='settings-wrap'>
              <GeneralSettings active={this.state.activeCategory === 'settings-general'} />
              <AccountsSettings active={this.state.activeCategory === 'settings-accounts'} />
              <AppearanceSettings active={this.state.activeCategory === 'settings-appearance'} />
              <PermissionsSettingsContainer active={this.state.activeCategory === 'settings-permissions'} />
              <TicketsSettings active={this.state.activeCategory === 'settings-tickets'} />
              <MailerSettingsContainer active={this.state.activeCategory === 'settings-mailer'} />
              <ElasticsearchSettingsContainer active={this.state.activeCategory === 'settings-elasticsearch'} />
              <BackupRestoreSettingsContainer active={this.state.activeCategory === 'settings-backup'} />
              <ServerSettingsController active={this.state.activeCategory === 'settings-server'} />
              <LegalSettingsContainer active={this.state.activeCategory === 'settings-legal'} />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

SettingsContainer.propTypes = {
  fetchSettings: PropTypes.func.isRequired,
  sidebar: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
  sidebar: state.sidebar
})

export default connect(mapStateToProps, { fetchSettings })(SettingsContainer)
