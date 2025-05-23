import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment-timezone'
import { observer } from 'mobx-react'
import { observable, entries, makeObservable, configure } from 'mobx'
import { isUndefined } from 'lodash'

import { MESSAGES_SPAWN_CHAT_WINDOW } from 'serverSocket/socketEventConsts'
import { startConversation } from 'lib2/chat'

import OffCanvas from 'components/OffCanvas'

import UIkit from 'uikit'

@observer
class OnlineUserListPartial extends React.Component {
  @observable activeUsers = new Map()

  constructor (props) {
    super(props)
    configure({ enforceActions: 'never' })
    makeObservable(this)

    this.onSocketUpdateUsers = this.onSocketUpdateUsers.bind(this)
  }

  componentDidMount () {
    this.props.socket.on('updateUsers', this.onSocketUpdateUsers)
  }

  componentWillUnmount () {
    this.props.socket.off('updateUsers', this.onSocketUpdateUsers)
  }

  onSocketUpdateUsers (data) {
    this.activeUsers.replace(data)
  }

  isActiveUser (username) {
    return !!this.activeUsers.get(username)
  }

  onUserClicked (e, _id) {
    e.preventDefault()
    UIkit.offcanvas.hide()

    startConversation(this.props.sessionUser._id, _id).then(conversation => {
      this.props.socket.emit(MESSAGES_SPAWN_CHAT_WINDOW, { convoId: conversation._id })
    })
  }

  fromNow (timezone, date) {
    if (isUndefined(date)) {
      return 'Никогда'
    }
    moment.updateLocale('en', {
      relativeTime: {
        future: 'в %s',
        past: '%s назад',
        s: 'несколько секунд',
        m: '1м',
        mm: '%dм',
        h: '1ч',
        hh: '%dч',
        d: '1д',
        dd: '%dд',
        M: '1мес',
        MM: '%dмес',
        y: '1г',
        yy: '%dлет'
      }
    })

    return moment
      .utc(date)
      .tz(timezone)
      .fromNow()
  }

  render () {
    const { timezone, users } = this.props
    return (
      <OffCanvas title={'Пользователи онлайн'} id={'online-user-list'}>
        <div style={{ padding: '0 5px' }}>
          <div className='active-now'>
            <h5>В сети</h5>
            <div className='online-list-wrapper'>
              <ul className='online-list'>
                {entries(this.activeUsers).map(([key, value]) => {
                  if (this.props.sessionUser && value.user._id === this.props.sessionUser._id) return null
                  const image = value.user.image || 'defaultProfile.jpg'
                  const isAgentOrAdmin = value.user.role.isAdmin || value.user.role.isAgent
                  return (
                    <li key={key}>
                      <a className={'no-ajaxy'} onClick={e => this.onUserClicked(e, value.user._id)}>
                        <div className='user-list-user'>
                          <div className='image'>
                            <img src={`/uploads/users/${image}`} alt='Автара' />
                          </div>
                          <span className='online-status' data-user-status-id={value.user._id} />
                          <div className={'user-name' + (isAgentOrAdmin ? ' _agent' : '')}>
                            {value.user.fullname + (isAgentOrAdmin ? ' - Агент' : '')}
                          </div>
                        </div>
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>

          <h5>Действия</h5>
          <div className='user-list-wrapper' style={{ lineHeight: 'normal' }}>
            <div
              className='online-list-search-box search-box'
              style={{ borderTop: '1px solid rgba(0,0,0,0.1)', borderRight: 'none' }}
            >
              <input type='text' placeholder={'Поиск'} />
            </div>
            <ul className='user-list'>
              {users.map(user => {
                if (this.props.sessionUser && user._id === this.props.sessionUser._id) return null
                const image = user.get('image') || 'defaultProfile.jpg'
                return (
                  <li key={user.get('_id')} data-search-term={user.get('fullname').toLowerCase()}>
                    <a className='no-ajaxy' onClick={e => OnlineUserListPartial.onUserClicked(e, user.get('_id'))}>
                      <div className='user-list-user'>
                        <div className='image'>
                          <img src={`/uploads/users/${image}`} alt='Аватара' />
                        </div>
                      </div>
                      <span
                        className={
                          'online-status-offline' + (this.isActiveUser(user.get('username')) ? ' success-text' : '')
                        }
                        data-user-status-id={user.get('_id')}
                      >
                        {this.isActiveUser(user.get('username'))
                          ? 'Now'
                          : this.fromNow(timezone, user.get('lastOnline'))}
                      </span>
                      <div className='user-name'>{user.get('fullname')}</div>
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </OffCanvas>
    )
  }
}

OnlineUserListPartial.propTypes = {
  sessionUser: PropTypes.object.isRequired,
  timezone: PropTypes.string.isRequired,
  users: PropTypes.array.isRequired,
  socket: PropTypes.object.isRequired
}

export default OnlineUserListPartial
