import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import SidebarItem from 'components/Nav/SidebarItem'
import NavSeparator from 'components/Nav/NavSeperator'
import Submenu from 'components/Nav/Submenu'
import SubmenuItem from 'components/Nav/SubmenuItem'

import { updateNavChange } from 'actions/nav'

import Helpers from 'lib/helpers'

class Sidebar extends React.Component {
  constructor (props) {
    super(props)
  }

  componentDidMount () {
    // Helpers.UI.getPlugins((err, result) => {
    //   if (!err && result.plugins) {
    //     this.setState({ plugins: result.plugins })
    //   }
    // })
    const sidebarRoute = document.getElementById('__sidebar_route').innerText
    const sidebarSubRoute = document.getElementById('__sidebar_sub_route').innerText

    this.props.updateNavChange({ activeItem: sidebarRoute, activeSubItem: sidebarSubRoute })
  }

  componentDidUpdate () {
    Helpers.UI.initSidebar()
    Helpers.UI.bindExpand()
  }

  renderPlugins () {
    const { plugins, sessionUser, activeItem, activeSubItem } = this.state
    return (
      <SidebarItem
        text='Плагины'
        icon='extension'
        href='/plugins'
        class='navPlugins tether-plugins'
        hasSubmenu={plugins && plugins.length > 0}
        subMenuTarget='plugins'
        active={activeItem === 'plugins'}
      >
        {plugins && plugins.length > 0 && (
          <Submenu id='plugins' subMenuOpen={activeItem === 'plugins'}>
            {plugins.map(function (item) {
              const perms = item.permissions.split(' ')
              if (perms.indexOf(sessionUser.role) === -1) return
              return (
                <SubmenuItem
                  key={item.name}
                  text={item.menu.main.name}
                  icon={item.menu.main.icon}
                  href={item.menu.main.link}
                  active={activeSubItem === item.name}
                />
              )
            })}
          </Submenu>
        )}
      </SidebarItem>
    )
  }

  render () {
    const { activeItem, activeSubItem, sessionUser } = this.props

    return (
      <div
        className={'sidebar nopadding'}
        style={{ overflowX: 'hidden', top: this.props.notice ? '95px' : '65px' }}
        data-scroll-opacitymax='0.1'
      >
        <div id={'side-nav-container'} style={{ minHeight: 'calc(100% - 50px)' }}>
          <ul className='side-nav'>
            {sessionUser && Helpers.canUser('agent:*', true) && (
              <SidebarItem
                text='Панель управления'
                icon='dashboard'
                href='/dashboard'
                class='navHome'
                active={activeItem === 'dashboard'}
              />
            )}
            {sessionUser && Helpers.canUser('tickets:view') && (
              <SidebarItem
                text='Задачи'
                icon='assignment'
                href='/tickets'
                class='navTickets no-ajaxy'
                hasSubmenu={true}
                subMenuTarget='tickets'
                active={activeItem === 'tickets'}
              >
                <Submenu id='tickets'>
                  <SubmenuItem
                    text='Активные'
                    icon='timer'
                    href='/tickets/active'
                    active={activeSubItem === 'tickets-active'}
                  />
                  <SubmenuItem
                    text='Назначенные'
                    icon='assignment_ind'
                    href='/tickets/assigned'
                    active={activeSubItem === 'tickets-assigned'}
                  />
                  <SubmenuItem
                    text='Неназначенные'
                    icon='person_add_disabled'
                    href='/tickets/unassigned'
                    active={activeSubItem === 'tickets-unassigned'}
                  />
                </Submenu>
              </SidebarItem>
            )}
            <SidebarItem
              text='Сообщения'
              icon='chat'
              href='/messages'
              class='navMessages'
              active={activeItem === 'messages'}
            />
            {sessionUser && Helpers.canUser('accounts:view') && (
              <SidebarItem
                text='Пользователи'
                icon='&#xE7FD;'
                href='/accounts'
                class='navAccounts'
                active={activeItem === 'accounts'}
                subMenuTarget='accounts'
                hasSubmenu={sessionUser && Helpers.canUser('agent:*', true)}
              >
                {sessionUser && Helpers.canUser('agent:*', true) && (
                  <Submenu id='accounts'>
                    <SubmenuItem
                      href={'/accounts/customers'}
                      text={'Пользователи'}
                      icon={'account_box'}
                      active={activeSubItem === 'accounts-customers'}
                    />
                    {sessionUser && Helpers.canUser('agent:*', true) && (
                      <SubmenuItem
                        href={'/accounts/agents'}
                        text={'Агенты'}
                        icon={'account_circle'}
                        active={activeSubItem === 'accounts-agents'}
                      />
                    )}
                    {sessionUser && Helpers.canUser('admin:*') && (
                      <SubmenuItem
                        href={'/accounts/admins'}
                        text={'Администраторы'}
                        icon={'how_to_reg'}
                        active={activeSubItem === 'accounts-admins'}
                      />
                    )}
                  </Submenu>
                )}
              </SidebarItem>
            )}
            {sessionUser && Helpers.canUser('groups:view') && (
              <SidebarItem
                text='Группы'
                icon='supervisor_account'
                href='/groups'
                class='navGroups'
                active={activeItem === 'groups'}
              />
            )}
            {sessionUser && Helpers.canUser('teams:view') && (
              <SidebarItem text='Команды' icon='wc' href='/teams' class='navTeams' active={activeItem === 'teams'} />
            )}
            {sessionUser && Helpers.canUser('departments:view') && (
              <SidebarItem
                text='Отделы'
                icon='domain'
                href='/departments'
                class='navTeams'
                active={activeItem === 'departments'}
              />
            )}
            {sessionUser && Helpers.canUser('reports:view') && (
              <SidebarItem
                text='Отчеты'
                icon='assessment'
                href='/reports/generate'
                class='navReports no-ajaxy'
                hasSubmenu={true}
                subMenuTarget='reports'
                active={activeItem === 'reports'}
              >
                <Submenu id='reports'>
                  <SubmenuItem
                    text='Сформировать'
                    icon='timeline'
                    href='/reports/generate'
                    active={activeSubItem === 'reports-generate'}
                  />
                  {/*<NavSeparator />*/}
                  {/*<SubmenuItem*/}
                  {/*  text='Group Breakdown'*/}
                  {/*  icon='supervisor_account'*/}
                  {/*  href='/reports/breakdown/group'*/}
                  {/*  active={activeSubItem === 'reports-breakdown-group'}*/}
                  {/*/>*/}
                  {/*<SubmenuItem*/}
                  {/*  text='User Breakdown'*/}
                  {/*  icon='perm_identity'*/}
                  {/*  href='/reports/breakdown/user'*/}
                  {/*  active={activeSubItem === 'reports-breakdown-user'}*/}
                  {/*/>*/}
                </Submenu>
              </SidebarItem>
            )}

            {/*{this.renderPlugins()}*/}

            {sessionUser && Helpers.canUser('notices:view') && (
              <SidebarItem
                text='Уведомления'
                icon='campaign'
                href='/notices'
                class='navNotices'
                active={activeItem === 'notices'}
              />
            )}

            {sessionUser && Helpers.canUser('settings:edit') && (
              <SidebarItem
                text='Настройки'
                icon='settings'
                href='/settings/general'
                class='navSettings no-ajaxy'
                hasSubmenu={true}
                subMenuTarget='settings'
                active={activeItem === 'settings'}
              >
                <Submenu id='settings'>
                  <SubmenuItem
                    text='Главные'
                    icon='tune'
                    href='/settings'
                    active={activeSubItem === 'settings-general'}
                  />
                  <SubmenuItem
                    text='Пользователи'
                    icon='tune'
                    href='/settings/accounts'
                    active={activeSubItem === 'settings-accounts'}
                  />
                  <SubmenuItem
                    text='Вид'
                    icon='style'
                    href='/settings/appearance'
                    active={activeSubItem === 'settings-appearance'}
                  />
                  <SubmenuItem
                    text='Задачи'
                    icon='assignment'
                    href='/settings/tickets'
                    active={activeSubItem === 'settings-tickets'}
                  />
                  <SubmenuItem
                    text='Права'
                    icon='security'
                    href='/settings/permissions'
                    active={activeSubItem === 'settings-permissions'}
                  />
                  <SubmenuItem
                    text='Почта'
                    icon='email'
                    href='/settings/mailer'
                    active={activeSubItem === 'settings-mailer'}
                  />
                  <SubmenuItem
                    href={'/settings/elasticsearch'}
                    text={'Elasticsearch'}
                    icon={'search'}
                    active={activeSubItem === 'settings-elasticsearch'}
                  />
                  <SubmenuItem
                    text='Бэкап'
                    icon='archive'
                    href='/settings/backup'
                    active={activeSubItem === 'settings-backup'}
                  />
                  <SubmenuItem
                    text='Сервер'
                    icon='dns'
                    href='/settings/server'
                    active={activeSubItem === 'settings-server'}
                  />
                  <SubmenuItem
                    text='Политика'
                    icon='gavel'
                    href='/settings/legal'
                    active={activeSubItem === 'settings-legal'}
                  />
                  {sessionUser && Helpers.canUser('settings:logs') && (
                    <SubmenuItem
                      text='Логи'
                      icon='remove_from_queue'
                      href='/settings/logs'
                      hasSeperator={true}
                      active={activeSubItem === 'settings-logs'}
                    />
                  )}
                </Submenu>
              </SidebarItem>
            )}
            <NavSeparator />
            <SidebarItem href='/about' icon='help' text='О программе' active={activeItem === 'about'} />
            {/*<SidebarItem href={'https://www.trudesk.io'} icon={'cloud'} text={'Cloud'} target={'_blank'} />*/}
          </ul>
        </div>
        <div className='side-nav-bottom-panel'>
          <a id='expand-menu' className='no-ajaxy' href='#'>
            <i className='material-icons'>menu</i>Скрыть меню
          </a>
        </div>
      </div>
    )
  }
}

Sidebar.propTypes = {
  updateNavChange: PropTypes.func.isRequired,
  activeItem: PropTypes.string.isRequired,
  activeSubItem: PropTypes.string.isRequired,
  sessionUser: PropTypes.object,
  plugins: PropTypes.array,
  notice: PropTypes.object
}

const mapStateToProps = state => ({
  activeItem: state.sidebar.activeItem,
  activeSubItem: state.sidebar.activeSubItem,
  sessionUser: state.shared.sessionUser,
  notice: state.shared.notice
})

export default connect(mapStateToProps, { updateNavChange })(Sidebar)
