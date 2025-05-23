import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { showModal, fetchRoles, updateRoleOrder } from 'actions/common'
import { updateSetting } from 'actions/settings'

import Button from 'components/Button'
import SettingItem from 'components/Settings/SettingItem'
import SingleSelect from 'components/SingleSelect'
import SplitSettingsPanel from 'components/Settings/SplitSettingsPanel'
import PermissionBody from './permissionBody'

import $ from 'jquery'

class PermissionsSettingsContainer extends React.Component {
  componentDidMount () {
    this.props.fetchRoles()
  }

  getSetting (name) {
    return this.props.settings.getIn(['settings', name, 'value'])
      ? this.props.settings.getIn(['settings', name, 'value'])
      : ''
  }

  onRoleOrderChanged (e) {
    const children = $(e.target).children('li')
    const arr = []
    for (let i = 0; i < children.length; i++) arr.push($(children[i]).attr('data-key'))

    this.props.updateRoleOrder({ roleOrder: arr })
  }

  getRoleMenu () {
    if (this.props.roleOrder && this.props.roleOrder.get('order') && this.props.roles) {
      const menu = this.props.roleOrder.get('order').map(o => {
        return this.props.roles.find(v => {
          return v.get('_id') === o
        })
      })

      return menu.toArray()
    }

    return []
  }

  onCreateRoleClicked (e) {
    e.preventDefault()

    this.props.showModal('CREATE_ROLE')
  }

  onDefaultUserRoleChange (e) {
    this.props.updateSetting({ name: 'role:user:default', value: e.target.value, stateName: 'defaultUserRole' })
  }

  render () {
    const mappedRoles = this.props.roles
      .map(role => {
        return { text: role.get('name'), value: role.get('_id') }
      })
      .toArray()

    return (
      <div className={this.props.active ? '' : 'hide'}>
        <SettingItem
          title={'Роль нового пользователя по умолчанию'}
          subtitle={'Роль, назначенная пользователям, созданным во время регистрации и публичных тикетов'}
          component={
            <SingleSelect
              items={mappedRoles}
              defaultValue={this.getSetting('defaultUserRole')}
              onSelectChange={e => {
                this.onDefaultUserRoleChange(e)
              }}
              width={'50%'}
              showTextbox={false}
            />
          }
        />
        <SplitSettingsPanel
          title={'Права'}
          tooltip={'Порядок разрешений — сверху вниз. Например: администраторы вверху, пользователи внизу.'}
          subtitle={
            <div>
              Создать/изменить роли {' '}
              <span className={'uk-text-danger'}>Примечание: изменения вступят в силу после обновления страницы.</span>
            </div>
          }
          rightComponent={
            <Button
              text={'Создать'}
              style={'success'}
              flat={true}
              waves={true}
              onClick={e => this.onCreateRoleClicked(e)}
            />
          }
          menuItems={this.getRoleMenu().map(role => {
            return { key: role.get('_id'), title: role.get('name'), bodyComponent: <PermissionBody role={role} /> }
          })}
          menuDraggable={true}
          menuOnDrag={e => {
            this.onRoleOrderChanged(e)
          }}
        />
      </div>
    )
  }
}

PermissionsSettingsContainer.propTypes = {
  active: PropTypes.bool.isRequired,
  roles: PropTypes.object.isRequired,
  roleOrder: PropTypes.object.isRequired,
  settings: PropTypes.object.isRequired,
  fetchRoles: PropTypes.func.isRequired,
  updateRoleOrder: PropTypes.func.isRequired,
  showModal: PropTypes.func.isRequired,
  updateSetting: PropTypes.func.isRequired
}

const mapStateToProps = state => ({
  roles: state.shared.roles,
  roleOrder: state.shared.roleOrder,
  settings: state.settings.settings
})

export default connect(mapStateToProps, { fetchRoles, updateRoleOrder, showModal, updateSetting })(
  PermissionsSettingsContainer
)
