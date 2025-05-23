import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import moment from 'moment-timezone'
import { observer } from 'mobx-react'
import { makeObservable, observable } from 'mobx'

import PDropdown from 'components/PDropdown'

import helpers from 'lib/helpers'
import { NOTIFICATIONS_UPDATE, NOTIFICATIONS_MARK_READ, NOTIFICATIONS_CLEAR } from 'serverSocket/socketEventConsts'
import 'history'

@observer
class NotificationsDropdownPartial extends React.Component {
  @observable notifications = []

  constructor (props) {
    super(props)
    makeObservable(this)

    this.onSocketUpdateNotifications = this.onSocketUpdateNotifications.bind(this)
    this.clearNotificationsClicked = this.clearNotificationsClicked.bind(this)
    this.markNotificationRead = this.markNotificationRead.bind(this)
  }

  componentDidMount () {
    this.props.socket.on(NOTIFICATIONS_UPDATE, this.onSocketUpdateNotifications)
  }

  componentWillUnmount () {
    this.props.socket.off(NOTIFICATIONS_UPDATE, this.onSocketUpdateNotifications)
  }

  onSocketUpdateNotifications (data) {
    if (!helpers.arrayIsEqual(this.notifications, data.items)) this.notifications = data.items
  }

  clearNotificationsClicked (e) {
    e.preventDefault()
    e.stopPropagation()

    this.props.socket.emit(NOTIFICATIONS_CLEAR)
  }

  markNotificationRead (e, notification) {
    e.preventDefault()
    e.stopPropagation()

    this.props.socket.emit(NOTIFICATIONS_MARK_READ, notification._id)

    History.pushState(null, null, `/tickets/${notification.data.ticket.uid}`)
  }

  render () {
    const { shortDateFormat, timezone, forwardedRef } = this.props

    return (
      <PDropdown
        ref={forwardedRef}
        id={'notifications'}
        title={'Уведомления'}
        topOffset={-4}
        leftOffset={4}
        rightComponent={
          <a className={'hoverUnderline no-ajaxy'} onClick={e => this.clearNotificationsClicked(e)}>
            Очистить уведомления
          </a>
        }
        footerComponent={
          <div className={'uk-text-center' + (this.notifications.length < 1 ? ' hide' : '')}>
            <a className={'no-ajaxy hoverUnderline'} onClick={this.props.onViewAllNotificationsClick}>
              Просмотр всех уведомлений
            </a>
          </div>
        }
      >
        {this.notifications.map(notification => {
          const formattedTimestamp = moment
            .utc(notification.created)
            .tz(timezone)
            .format('YYYY-MM-DDThh:mm')
          const formattedDate = moment
            .utc(notification.created)
            .tz(timezone)
            .format(shortDateFormat)
          return (
            <li key={notification._id}>
              <a className='item no-ajaxy' onClick={e => this.markNotificationRead(e, notification)}>
                <div className='uk-clearfix'>
                  {notification.unread && <div className={'messageUnread'} />}
                  {notification.type === 0 && (
                    <div className={'messageIcon left'}>
                      <i className='fa fa-check green' />
                    </div>
                  )}
                  {notification.type === 1 && (
                    <div className={'messageIcon left'}>
                      <i className='fa fa-comment-o green' style={{ marginTop: '-5px' }} />
                    </div>
                  )}
                  {notification.type === 2 && (
                    <div className={'messageIcon left'}>
                      <i className='fa fa-exclamation red' />
                    </div>
                  )}
                  <div className='messageAuthor'>
                    <strong>{notification.title}</strong>
                  </div>
                  <div className='messageSnippet'>
                    <span>{notification.message}</span>
                  </div>
                  <div className='messageDate'>
                    <time dateTime={formattedTimestamp} className={'timestamp'}>
                      {formattedDate}
                    </time>
                  </div>
                </div>
              </a>
            </li>
          )
        }, this)}
      </PDropdown>
    )
  }
}

NotificationsDropdownPartial.propTypes = {
  socket: PropTypes.object.isRequired,
  timezone: PropTypes.string.isRequired,
  shortDateFormat: PropTypes.string.isRequired,
  onViewAllNotificationsClick: PropTypes.func.isRequired,
  forwardedRef: PropTypes.any
}

const mapStateToProps = state => ({
  socket: state.shared.socket
})

export default connect(mapStateToProps, {}, null, { forwardRef: true })(NotificationsDropdownPartial)
