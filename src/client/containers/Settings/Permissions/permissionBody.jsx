import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { observer } from 'mobx-react'
import { makeObservable, observable } from 'mobx'
import { isEqual } from 'lodash'
import { updatePermissions } from 'actions/settings'
import { showModal } from 'actions/common'

import Button from 'components/Button'
import SettingItem from 'components/Settings/SettingItem'
import EnableSwitch from 'components/Settings/EnableSwitch'
import PermissionGroupPartial from './permissionGroupPartial'

import helpers from 'lib/helpers'

function defaultGrants () {
  return {
    all: false,
    create: false,
    view: false,
    update: false,
    delete: false,
    special: []
  }
}

@observer
class PermissionBody extends React.Component {
  @observable isAdmin = ''
  @observable isAgent = ''
  @observable hasHierarchy = ''
  grants = []

  @observable ticketGrants = defaultGrants()
  @observable commentGrants = defaultGrants()
  @observable accountGrants = defaultGrants()
  @observable groupGrants = defaultGrants()
  @observable teamGrants = defaultGrants()
  @observable departmentGrants = defaultGrants()
  @observable reportGrants = defaultGrants()
  @observable noticeGrants = defaultGrants()

  constructor (props) {
    super(props)
    makeObservable(this)
  }

  componentDidMount () {
    this.isAdmin = this.props.role.get('isAdmin') || false
    this.isAgent = this.props.role.get('isAgent') || false
    this.hasHierarchy = this.props.role.get('hierarchy') || false
    this.grants = this.props.role.get('grants').toArray() || []

    this.parseGrants()
  }

  componentDidUpdate () {
    if (this.isAdmin === '') this.isAdmin = this.props.role.get('isAdmin') || false
    if (this.isAgent === '') this.isAgent = this.props.role.get('isAgent') || false
    if (this.hasHierarchy === '') this.hasHierarchy = this.props.role.get('hierarchy') || false
    if (this.grants.length < 1) this.grants = this.props.role.get('grants').toArray() || []

    this.parseGrants()
  }

  parseGrants () {
    if (!this.grants) return
    const parsedGrants = helpers.parseRoleGrants(this.grants)

    if (parsedGrants.tickets && !isEqual(parsedGrants.tickets, this.ticketGrants))
      this.ticketGrants = parsedGrants.tickets

    if (parsedGrants.comments && !isEqual(parsedGrants.comments, this.commentGrants))
      this.commentGrants = parsedGrants.comments

    if (parsedGrants.accounts && !isEqual(parsedGrants.accounts, this.accountGrants))
      this.accountGrants = parsedGrants.accounts

    if (parsedGrants.groups && !isEqual(parsedGrants.groups, this.groupGrants)) this.groupGrants = parsedGrants.groups
    if (parsedGrants.teams && !isEqual(parsedGrants.teams, this.teamGrants)) this.teamGrants = parsedGrants.teams
    if (parsedGrants.departments && !isEqual(parsedGrants.departments, this.departmentGrants))
      this.departmentGrants = parsedGrants.departments

    if (parsedGrants.reports && !isEqual(parsedGrants.reports, this.reportGrants))
      this.reportGrants = parsedGrants.reports

    if (parsedGrants.notices && !isEqual(parsedGrants.notices, this.noticeGrants))
      this.noticeGrants = parsedGrants.notices
  }

  onEnableSwitchChanged (e, name) {
    this[name] = e.target.checked
  }

  static mapTicketSpecials () {
    return [
      { title: 'Печать', perm: 'print' },
      { title: 'Заметки', perm: 'notes' },
      { title: 'Управление публичными задачами', perm: 'public' },
      { title: 'Можно просматривать все задачи в назначенных группах', perm: 'viewall' }
    ]
  }

  static mapAccountSpecials () {
    return [{ title: 'Импорт', perm: 'import' }]
  }

  static mapNoticeSpecials () {
    return [
      { title: 'Активировать', perm: 'activate' },
      { title: 'Деактивировать', perm: 'deactivate' }
    ]
  }

  onSubmit (e) {
    e.preventDefault()
    const obj = {}
    obj._id = this.props.role.get('_id')
    if (this.isAdmin) {
      obj.admin = ['*']
      obj.settings = ['*']
    }
    if (this.isAgent) obj.agent = ['*']
    obj.hierarchy = this.hasHierarchy

    obj.tickets = PermissionBody.buildPermArray(this.ticketPermGroup)
    obj.comments = PermissionBody.buildPermArray(this.commentPermGroup)
    obj.accounts = PermissionBody.buildPermArray(this.accountPermGroup)
    obj.groups = PermissionBody.buildPermArray(this.groupPermGroup)
    obj.teams = PermissionBody.buildPermArray(this.teamPermGroup)
    obj.departments = PermissionBody.buildPermArray(this.departmentPermGroup)
    obj.reports = PermissionBody.buildPermArray(this.reportPermGroup)
    obj.notices = PermissionBody.buildPermArray(this.noticePermGroup)

    this.props.updatePermissions(obj)
  }

  static buildPermArray (permGroup) {
    let arr = []
    if (permGroup.all) arr = ['*']
    else {
      if (permGroup.create) arr.push('create')
      if (permGroup.view) arr.push('view')
      if (permGroup.update) arr.push('update')
      if (permGroup.delete) arr.push('delete')
      if (permGroup.special) arr.push(permGroup.special.join(' '))
    }

    return arr
  }

  showDeletePermissionRole (e) {
    e.preventDefault()
    this.props.showModal('DELETE_ROLE', { role: this.props.role })
  }

  render () {
    return (
      <div>
        <form onSubmit={e => this.onSubmit(e)}>
          <SettingItem
            title={'Администратор'}
            tooltip={'Роль администратора trudesk.'}
            subtitle={'Определена ли эта роль как роль администратора?'}
            component={
              <EnableSwitch
                stateName={'isAdmin_' + this.props.role.get('_id')}
                label={'Включить'}
                checked={this.isAdmin}
                onChange={e => this.onEnableSwitchChanged(e, 'isAdmin')}
              />
            }
          />
          <SettingItem
            title={'Агент'}
            subtitle={'Определена ли эта роль как роль агента?'}
            tooltip={'Роль считается ролью агента.'}
            component={
              <EnableSwitch
                stateName={'isAgent_' + this.props.role.get('_id')}
                label={'Включить'}
                checked={this.isAgent}
                onChange={e => this.onEnableSwitchChanged(e, 'isAgent')}
              />
            }
          />
          <SettingItem
            title={'Включить иерархию'}
            subtitle={'Включение этого пункта включает иерархическое наложение ролей.'}
            component={
              <EnableSwitch
                stateName={'hasHierarchy_' + this.props.role.get('_id')}
                label={'Включить'}
                checked={this.hasHierarchy}
                onChange={e => this.onEnableSwitchChanged(e, 'hasHierarchy')}
              />
            }
          />
          <PermissionGroupPartial
            ref={i => (this.ticketPermGroup = i)}
            title={'Задачи'}
            role={this.props.role}
            grants={this.ticketGrants}
            roleSpecials={PermissionBody.mapTicketSpecials()}
            subtitle={'Права для задач'}
          />
          <PermissionGroupPartial
            ref={i => (this.commentPermGroup = i)}
            title={'Комментарии'}
            role={this.props.role}
            grants={this.commentGrants}
            subtitle={'Права для комментариев'}
          />
          <PermissionGroupPartial
            ref={i => (this.accountPermGroup = i)}
            title={'Пользователи'}
            role={this.props.role}
            roleSpecials={PermissionBody.mapAccountSpecials()}
            grants={this.accountGrants}
            subtitle={'Права на пользователей'}
          />
          <PermissionGroupPartial
            ref={i => (this.groupPermGroup = i)}
            title={'Группы'}
            role={this.props.role}
            grants={this.groupGrants}
            subtitle={'Права на группы'}
          />
          <PermissionGroupPartial
            ref={i => (this.teamPermGroup = i)}
            title={'Команды'}
            role={this.props.role}
            grants={this.teamGrants}
            subtitle={'Парва на команды'}
          />
          <PermissionGroupPartial
            ref={i => (this.departmentPermGroup = i)}
            title={'Отделы'}
            role={this.props.role}
            grants={this.departmentGrants}
            subtitle={'Права на отделы'}
          />
          <PermissionGroupPartial
            ref={i => (this.reportPermGroup = i)}
            title={'Отчеты'}
            role={this.props.role}
            grants={this.reportGrants}
            subtitle={'Права на отчеты'}
          />
          <PermissionGroupPartial
            ref={i => (this.noticePermGroup = i)}
            title={'Заметки'}
            role={this.props.role}
            grants={this.noticeGrants}
            roleSpecials={PermissionBody.mapNoticeSpecials()}
            subtitle={'Права на заметки'}
          />
          <div className={'uk-margin-large-bottom'}>
            <h2 className='text-light'>Опасная зона</h2>
            <div className='danger-zone'>
              <div className='dz-box uk-clearfix'>
                <div className='uk-float-left'>
                  <h5>Удалить эту роль?</h5>
                  <p>После удаления роли разрешения пути назад уже не будет!</p>
                </div>
                <div className='uk-float-right' style={{ paddingTop: '10px' }}>
                  <Button
                    text={'Удалить'}
                    small={true}
                    style={'danger'}
                    onClick={e => this.showDeletePermissionRole(e)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className='box uk-clearfix'>
              <div className='uk-float-right' style={{ paddingTop: '10px' }}>
                <Button type={'submit'} style={'success'} waves={true} text={'Сохранить'} />
              </div>
            </div>
          </div>
        </form>
      </div>
    )
  }
}

PermissionBody.propTypes = {
  role: PropTypes.object.isRequired,
  updatePermissions: PropTypes.func.isRequired,
  showModal: PropTypes.func.isRequired
}

export default connect(null, { updatePermissions, showModal })(PermissionBody)
