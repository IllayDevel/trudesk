import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  fetchMongoDBTools,
  fetchBackups,
  backupNow,
  fetchDeletedTickets,
  restoreDeletedTicket,
  permDeleteTicket,
  changeDeletedTicketsPage
} from 'actions/settings'
import Log from '../../../logger'

import { BACKUP_RESTORE_SHOW_OVERLAY, BACKUP_RESTORE_COMPLETE } from 'serverSocket/socketEventConsts'

import $ from 'jquery'
import UIKit from 'uikit'
import axios from 'axios'
import helpers from 'lib/helpers'

import ButtonGroup from 'components/ButtonGroup'
import Button from 'components/Button'
import SettingItem from 'components/Settings/SettingItem'
import Zone from 'components/ZoneBox/zone'
import ZoneBox from 'components/ZoneBox'

class BackupRestoreSettingsContainer extends React.Component {
  constructor (props) {
    super(props)

    this.initBackupUpload = this.initBackupUpload.bind(this)
  }

  componentDidMount () {
    this.props.fetchMongoDBTools()
    this.props.fetchBackups()
    this.props.fetchDeletedTickets()
  }

  componentDidUpdate (prevProps) {
    this.initBackupUpload()
    if (!this.deletedTicketsPagination) {
      const $deletedTicketPagination = $('.deletedTicketPagination')
      if ($deletedTicketPagination.length > 0) {
        this.deletedTicketsPagination = UIKit.pagination($deletedTicketPagination, {
          items: this.props.settings.deletedTicketsCount,
          itemsOnPage: 15
        })
        $deletedTicketPagination.on('select.uk.pagination', (e, pageIndex) => {
          this.props.changeDeletedTicketsPage(pageIndex)
        })
      }
    }

    if (prevProps.settings.deletedTicketsCount !== this.props.settings.deletedTicketsCount) {
      this.deletedTicketsPagination.pages = Math.ceil(this.props.settings.deletedTicketsCount / 15)
        ? Math.ceil(this.props.settings.deletedTicketsCount / 15)
        : 1
      this.deletedTicketsPagination.render()
      if (this.deletedTicketsPagination.currentPage > this.deletedTicketsPagination.pages - 1)
        this.deletedTicketsPagination.selectPage(this.deletedTicketsPagination.pages - 1)
    }
  }

  componentWillUnmount () {
    if (this.deletedTicketsPagination) {
      this.deletedTicketsPagination.element.off('select.uk.pagination')
      this.deletedTicketsPagination = null
    }
  }

  initBackupUpload () {
    const $progressBar = $(this.backupUploadProgressbar)
    const $uploadSelect = $(this.backupUploadSelect)
    const $uploadButton = $(this.backupUploadBtn)
    const bar = $progressBar.find('.uk-progress-bar')

    if ($progressBar.length < 1 || $uploadSelect.length < 1 || $uploadButton.length < 1) return

    const self = this

    const settings = {
      action: '/api/v1/backup/upload',
      allow: '*.zip',
      type: 'json',

      loadstart: function () {
        bar.css('width', '0%').text('0%')
        $progressBar.removeClass('hide')
        $uploadButton.addClass('hide')
      },
      notallowed: function () {
        helpers.UI.showSnackbar('Неверный тип файла. Загрузите Zip файл.', true)
      },
      error: function (err) {
        Log.error(err)
        helpers.UI.showSnackbar('Произошла неизвестная ошибка. Проверьте консоль', true)
      },
      progress: function (percent) {
        percent = Math.ceil(percent)
        bar.css('width', percent + '%').text(percent + '%')
      },

      allcomplete: function (response) {
        Log.debug(response)
        if (!response.success) {
          helpers.UI.showSnackbar(response.error, true)
        }

        bar.css('width', '100%').text('100%')

        setTimeout(() => {
          $progressBar.addClass('hide')
          $uploadButton.removeClass('hide')
          $uploadSelect.val(null)
          self.props.fetchBackups()
          helpers.UI.playSound('success')
        }, 1500)
      }
    }

    UIKit.uploadSelect($uploadSelect, settings)
  }

  onBackupNowClicked (e) {
    e.preventDefault()
    this.props.backupNow()
  }

  oneRestoreClicked (e, backup) {
    if (!backup) return

    const filename = backup.get('filename')
    UIKit.modal.confirm(
      `<h2>Вы уверены?</h2>
        <p style="font-size: 15px;">
        <span class="uk-text-danger" style="font-size: 15px;">Это необратимое действие.</span> 
        База данных будет очищена и восстановлена с помощью выбранного файла резервной копии: <strong>${filename}</strong>
        </p>
        <p style="font-size: 12px;">
            Любые пользователи, которые в настоящее время вошли в систему, будут видеть страницу блокировки. После завершения все пользователи должны будут войти в систему снова.</p><br />
        <p style="font-size: 12px; font-style: italic;">
         Этот процесс может занять некоторое время в зависимости от размера резервной копии.
        </p>`,
      () => {
        this.props.socket.emit(BACKUP_RESTORE_SHOW_OVERLAY)

        axios
          .post('/api/v1/backup/restore', { file: filename })
          .then(() => {
            helpers.UI.showSnackbar('Восстановление завершено. Выход всех пользователей...')
            setTimeout(() => {
              this.props.socket.emit(BACKUP_RESTORE_COMPLETE)
            }, 2000)
          })
          .catch(err => {
            Log.error(err)
            helpers.UI.showSnackbar('Произошла ошибка. Проверьте консоль..', true)
          })
      },
      {
        labels: { Ok: 'Да', Cancel: 'Нет' },
        confirmButtonClass: 'md-btn-danger'
      }
    )
  }

  onDeleteBackupClicked (e, backup) {
    UIKit.modal.confirm(
      `<h2 class="text-light">Вы уверены?</h2>
        <p style="font-size: 14px;">Вы действительно хотите удалить файл: 
            <strong>${backup.get('filename')}</strong>
        </p>`,
      () => {
        axios
          .delete(`/api/v1/backup/${backup.get('filename')}`)
          .then(res => {
            if (res.data && res.data.success) {
              this.props.fetchBackups()
              helpers.UI.showSnackbar('Резервная копия удалена')
            } else {
              helpers.UI.showSnackbar('Не могу удалить резервную копию', true)
            }
          })
          .catch(err => {
            Log.error(err)
            helpers.UI.showSnackbar(`Ошибка: ${err.response.data.error}`, true)
          })
      },
      {
        labels: { Ok: 'Да', Cancel: 'Нет' },
        confirmButtonClass: 'md-btn-danger'
      }
    )
  }

  onRestoreTicketClicked (e, ticket) {
    if (!ticket) return

    this.props.restoreDeletedTicket({ _id: ticket.get('_id') })
  }

  onDeleteTicketClicked (e, ticket) {
    if (!ticket) return

    this.props.permDeleteTicket({ _id: ticket.get('_id') })
  }

  render () {
    const { active } = this.props

    return (
      <div className={active ? 'active' : 'hide'}>
        {!this.props.settings.hasMongoDBTools && (
          <SettingItem
            title={'MongoDB Tools не найдены'}
            subtitle={'Не установлены MongoDB tools. Пожалуйста установите необходимые компоненты.'}
          >
            <div>
              <h4>Installing MongoDB Tools</h4>
              <p style={{ margin: '0 0 5px 0', fontSize: '13px' }}>
                MongoDB Tools are required to perform backup and restore. See below for instructions on installing
                MongoDB Tools.
              </p>
              <h5>
                <strong>Ubuntu 18.04</strong>
              </h5>
              <pre style={{ whiteSpace: 'pre-line' }}>sudo apt install -y mongo-tools</pre>
              <br />
              <h5>
                <strong>ArchLinux</strong>
              </h5>
              <pre style={{ whiteSpace: 'pre-line' }}>yay -S mongodb-tools-bin</pre>
              <br />
              <h5>
                <strong>Fedora 29</strong>
              </h5>
              <pre>dnf install -y mongo-tools</pre>
              <br />
              <h5>
                <strong>Alpine Linux</strong>
              </h5>
              <pre>apk add mongodb-tools</pre>
            </div>
          </SettingItem>
        )}
        {this.props.settings.hasMongoDBTools && (
          <div>
            <SettingItem
              title={'Резервное копирование'}
              subtitle={'Резервное копирование всех данных сайта. (База данных, вложения, активы)'}
              component={
                <div className={'uk-float-right mt-10'}>
                  <div
                    className={
                      'uk-progress uk-progress-success uk-progress-striped uk-active' +
                      (!this.props.settings.backingup ? ' hide ' : '')
                    }
                    style={{ height: '31px', background: 'transparent' }}
                  >
                    <div
                      className='uk-progress-bar uk-float-right'
                      style={{ width: '115px', fontSize: '11px', textTransform: 'uppercase', lineHeight: '31px' }}
                    >
                      Подождите...
                    </div>
                  </div>
                  {!this.props.settings.backingup && (
                    <Button
                      text={'Резервное копирование'}
                      style={'success'}
                      small={true}
                      styleOverride={{ width: '215px' }}
                      onClick={e => this.onBackupNowClicked(e)}
                    />
                  )}
                </div>
              }
            />
            <SettingItem
              title={'Резервные копии'}
              subtitle={'Текущие резервные копии'}
              component={
                <div className={'uk-float-right mt-10'} style={{ width: '85px' }}>
                  <div
                    className={'uk-progress hide'}
                    style={{ height: '31px' }}
                    ref={i => (this.backupUploadProgressbar = i)}
                  >
                    <div className='uk-progress-bar' style={{ width: 0, lineHeight: '31px', fontSize: '11px' }}>
                      0%
                    </div>
                  </div>
                  <form className='uk-form-stacked'>
                    <button
                      className={'md-btn md-btn-small md-btn-primary uk-form-file no-ajaxy'}
                      style={{ width: '85px' }}
                      ref={i => (this.backupUploadBtn = i)}
                    >
                      Загрузить
                      <input ref={i => (this.backupUploadSelect = i)} type={'file'} name={'backupUploadSelect'} />
                    </button>
                  </form>
                </div>
              }
            >
              {this.props.settings.backups.size < 1 && (
                <Zone>
                  <ZoneBox>
                    <h2 className={'uk-text-muted uk-text-center'}>Нет копий</h2>
                  </ZoneBox>
                </Zone>
              )}
              {this.props.settings.backups.size > 0 && (
                <table className='uk-table mt-0'>
                  <thead>
                    <tr>
                      <th>Имя файла</th>
                      <th>Размер</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {this.props.settings.backups.map(backup => {
                      return (
                        <tr key={backup.get('filename')}>
                          <td className={'valign-middle'} style={{ width: '60%', height: '60px' }}>
                            {backup.get('filename')}
                          </td>
                          <td className='valign-middle'>{backup.get('sizeFormat')}</td>
                          <td className='uk-text-right valign-middle'>
                            <ButtonGroup>
                              <a
                                href={`/backups/${backup.get('filename')}`}
                                className={'md-btn md-btn-small md-btn-wave no-ajaxy'}
                                download={backup.get('filename')}
                              >
                                Скачать
                              </a>
                              <Button
                                text={'Восстановить'}
                                small={true}
                                waves={true}
                                onClick={e => this.oneRestoreClicked(e, backup)}
                              />
                              <Button
                                text={'Удалить'}
                                small={true}
                                style={'danger'}
                                waves={true}
                                onClick={e => this.onDeleteBackupClicked(e, backup)}
                              />
                            </ButtonGroup>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </SettingItem>
          </div>
        )}
        <SettingItem title={'Удаленные задачи'} subtitle={'Задачи, отмеченные как удаленные.'}>
          {this.props.settings.deletedTickets.size < 1 && (
            <Zone>
              <ZoneBox>
                <h2 className='uk-text-muted uk-text-center'>Нет удаленных задач</h2>
              </ZoneBox>
            </Zone>
          )}
          {this.props.settings.deletedTickets.size > 0 && (
            <div>
              <table className='uk-table mt-0 mb-5'>
                <thead>
                  <tr>
                    <th>UID</th>
                    <th>Тема</th>
                    <th>Группа</th>
                    <th>Дата</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {this.props.settings.deletedTickets.map(ticket => {
                    return (
                      <tr key={ticket.get('_id')}>
                        <td className='valign-middle' style={{ width: '10%', height: '60px' }}>
                          {ticket.get('uid')}
                        </td>
                        <td className='valign-middle' style={{ width: '30%' }}>
                          {ticket.get('subject')}
                        </td>
                        <td className='valign-middle' style={{ width: '30%' }}>
                          {ticket.getIn(['group', 'name'])}
                        </td>
                        <td className='valign-middle' style={{ width: '30%' }}>
                          {ticket.get('date')}
                        </td>
                        <td className='uk-text-right valign-middle'>
                          <ButtonGroup>
                            <Button
                              text={'Удалить'}
                              style={'danger'}
                              small={true}
                              waves={true}
                              onClick={e => this.onDeleteTicketClicked(e, ticket)}
                            />
                            <Button
                              text={'Восстановить'}
                              small={true}
                              waves={true}
                              onClick={e => this.onRestoreTicketClicked(e, ticket)}
                            />
                          </ButtonGroup>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <div className='uk-pagination deletedTicketPagination' />
            </div>
          )}
        </SettingItem>
      </div>
    )
  }
}

BackupRestoreSettingsContainer.propTypes = {
  socket: PropTypes.object.isRequired,
  active: PropTypes.bool.isRequired,
  fetchMongoDBTools: PropTypes.func.isRequired,
  fetchBackups: PropTypes.func.isRequired,
  fetchDeletedTickets: PropTypes.func.isRequired,
  changeDeletedTicketsPage: PropTypes.func.isRequired,
  backupNow: PropTypes.func.isRequired,
  restoreDeletedTicket: PropTypes.func.isRequired,
  permDeleteTicket: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
  socket: state.shared.socket,
  settings: state.settings
})

export default connect(mapStateToProps, {
  fetchBackups,
  fetchMongoDBTools,
  backupNow,
  fetchDeletedTickets,
  restoreDeletedTicket,
  permDeleteTicket,
  changeDeletedTicketsPage
})(BackupRestoreSettingsContainer)
