import { call, put, takeLatest } from 'redux-saga/effects'
import axios from 'axios'

import api from '../../api'
import {
  BACKUP_NOW,
  CREATE_ROLE,
  DELETE_ROLE,
  FETCH_BACKUPS,
  FETCH_DELETED_TICKETS,
  FETCH_MONGODB_TOOLS,
  FETCH_ROLES,
  FETCH_SETTINGS,
  HIDE_MODAL,
  RESTORE_DELETED_TICKET,
  PERM_DELETE_TICKET,
  UPDATE_COLORSCHEME,
  UPDATE_MULTIPLE_SETTINGS,
  UPDATE_PERMISSIONS,
  UPDATE_ROLE_ORDER,
  UPDATE_SETTING
} from 'actions/types'

import Log from '../../logger'
import helpers from 'lib/helpers'

function fetchSettings () {
  return axios
    .get('/api/v1/settings')
    .then(res => {
      return res.data
    })
    .catch(error => {
      throw error.response
    })
}

function * fetchFlow ({ payload }) {
  try {
    const response = yield call(fetchSettings, payload)
    yield put({ type: FETCH_SETTINGS.SUCCESS, response })
  } catch (error) {
    // if (error.status === (401 || 403))
    //     yield put({type: LOGOUT});
    yield put({ type: FETCH_SETTINGS.ERROR, error })
  }
}

function * updateSetting ({ payload, meta }) {
  try {
    const response = yield call(api.settings.update, [payload])
    if (!payload.noSnackbar) helpers.UI.showSnackbar('Настройки успешно сохранены', false)
    yield put({ type: UPDATE_SETTING.SUCCESS, response, payload, meta })
  } catch (error) {
    yield put({ type: UPDATE_SETTING.ERROR, error, meta })
  }
}

function * updateMultipleSettings ({ payload }) {
  try {
    const response = yield call(api.settings.update, payload)
    yield put({ type: UPDATE_MULTIPLE_SETTINGS.SUCCESS, response })
    helpers.UI.showSnackbar('Настройки успешно сохранены.', false)
    yield put({ type: FETCH_SETTINGS.ACTION })
  } catch (error) {
    helpers.UI.showSnackbar(error, true)
    yield put({ type: UPDATE_MULTIPLE_SETTINGS.ERROR, error })
  }
}

function * updateColorScheme ({ payload }) {
  try {
    const response = yield call(api.settings.update, payload)
    yield put({ type: UPDATE_COLORSCHEME.SUCCESS, response })
    yield call(api.settings.buildSass)
    helpers.UI.showSnackbar('Настройки успешно сохранены. Перезагрузка...', false)
    setTimeout(function () {
      window.location.reload()
    }, 1000)
  } catch (error) {
    helpers.UI.showSnackbar(error, true)
    yield put({ type: UPDATE_MULTIPLE_SETTINGS.ERROR, error })
  }
}

function * checkMongoDBTools ({ payload }) {
  try {
    const response = yield call(api.settings.hasMongoDBTools, payload)
    yield put({ type: FETCH_MONGODB_TOOLS.SUCCESS, response })
  } catch (error) {
    yield put({ type: FETCH_MONGODB_TOOLS.ERROR, error })
  }
}

function * fetchBackups () {
  try {
    const response = yield call(api.settings.fetchBackups)
    yield put({ type: FETCH_BACKUPS.SUCCESS, response })
  } catch (error) {
    const errorText = error.response.data.error
    helpers.UI.showSnackbar(`Ошибка: ${errorText}`, true)
    yield put({ type: FETCH_BACKUPS.ERROR, error })
  }
}

function * backupNow () {
  try {
    yield put({ type: BACKUP_NOW.PENDING })
    const response = yield call(api.settings.backupNow)
    yield put({ type: BACKUP_NOW.SUCCESS, response })
    yield put({ type: FETCH_BACKUPS.ACTION })
    helpers.UI.showSnackbar('Бэкап упешно создан.')
  } catch (error) {
    if (!error.response) return Log.error(error)
    const errorText = error.response.data.error
    helpers.UI.showSnackbar(`Ошибка: ${errorText}`, true)
    yield put({ type: BACKUP_NOW.ERROR, error })
  }
}

function * fetchDeletedTickets () {
  try {
    yield put({ type: FETCH_DELETED_TICKETS.PENDING })
    const response = yield call(api.settings.fetchDeletedTickets)
    yield put({ type: FETCH_DELETED_TICKETS.SUCCESS, response })
  } catch (error) {
    const errorText = error.response.data.error
    helpers.UI.showSnackbar(`Ошибка: ${errorText}`, true)
    yield put({ type: FETCH_DELETED_TICKETS.ERROR, error })
  }
}

function * restoreDeletedTicket ({ payload }) {
  try {
    const response = yield call(api.settings.restoreDeletedTicket, payload)
    yield put({ type: RESTORE_DELETED_TICKET.SUCCESS, response, payload })
    helpers.UI.showSnackbar('Задача восстановлена')
  } catch (error) {
    const errorText = error.response.data.error
    helpers.UI.showSnackbar(`Ошибка: ${errorText}`, true)
    yield put({ type: RESTORE_DELETED_TICKET.ERROR, error })
  }
}

function * permDeleteTicket ({ payload }) {
  try {
    const response = yield call(api.settings.permDeleteTicket, payload)
    yield put({ type: PERM_DELETE_TICKET.SUCCESS, response, payload })
    helpers.UI.showSnackbar('Задача удалена')
  } catch (error) {
    const errorText = error.response ? error.response.data.error : error
    if (error.response && error.response.status !== (401 || 403)) {
      Log.error(errorText, error)
      helpers.UI.showSnackbar(`Ошибка: ${errorText}`, true)
    }

    yield put({ type: PERM_DELETE_TICKET.ERROR, error })
  }
}

function * updateRoleOrder ({ payload }) {
  try {
    const response = yield call(api.settings.updateRoleOrder, payload)
    yield put({ type: UPDATE_ROLE_ORDER.SUCCESS, response })
  } catch (error) {
    const errorText = error.response.data.error
    helpers.UI.showSnackbar(`Ошибка: ${errorText}`, true)
    yield put({ type: UPDATE_ROLE_ORDER.ERROR, error })
  }
}

function * updatePermissions ({ payload }) {
  try {
    yield put({ type: UPDATE_PERMISSIONS.PENDING })
    const response = yield call(api.settings.updatePermissions, payload)
    yield put({ type: UPDATE_PERMISSIONS.SUCCESS, response })
    helpers.UI.showSnackbar('Обновлена роль. Сброс разрешений...')
  } catch (error) {
    const errorText = error.response.data.error
    helpers.UI.showSnackbar(`Ошибка: ${errorText}`, true)
    yield put({ type: UPDATE_PERMISSIONS.ERROR, error })
  }
}

function * createRole ({ payload }) {
  try {
    const response = yield call(api.settings.createRole, payload)
    yield put({ type: CREATE_ROLE.SUCCESS, response })
    yield put({ type: FETCH_ROLES.ACTION })
    yield put({ type: HIDE_MODAL })
  } catch (error) {
    const errorText = error.response.data.error
    helpers.UI.showSnackbar(`Ошибка: ${errorText}`, true)
    yield put({ type: CREATE_ROLE.ERROR, error })
  }
}

function * deleteRole ({ payload }) {
  try {
    const response = yield call(api.settings.deleteRole, payload)
    yield put({ type: DELETE_ROLE.SUCCESS, response })
    yield put({ type: FETCH_ROLES.ACTION })
    yield put({ type: HIDE_MODAL })
    helpers.UI.showSnackbar('Роль удалена.')
  } catch (error) {
    const errorText = error.response.data.error
    helpers.UI.showSnackbar(`Ошибка: ${errorText}`, true)
    yield put({ type: DELETE_ROLE.ERROR, error })
  }
}

export default function * settingsWatcher () {
  yield takeLatest(FETCH_SETTINGS.ACTION, fetchFlow)
  yield takeLatest(UPDATE_SETTING.ACTION, updateSetting)
  yield takeLatest(UPDATE_MULTIPLE_SETTINGS.ACTION, updateMultipleSettings)
  yield takeLatest(UPDATE_COLORSCHEME.ACTION, updateColorScheme)
  yield takeLatest(FETCH_MONGODB_TOOLS.ACTION, checkMongoDBTools)
  yield takeLatest(FETCH_BACKUPS.ACTION, fetchBackups)
  yield takeLatest(BACKUP_NOW.ACTION, backupNow)
  yield takeLatest(FETCH_DELETED_TICKETS.ACTION, fetchDeletedTickets)
  yield takeLatest(RESTORE_DELETED_TICKET.ACTION, restoreDeletedTicket)
  yield takeLatest(PERM_DELETE_TICKET.ACTION, permDeleteTicket)
  yield takeLatest(UPDATE_ROLE_ORDER.ACTION, updateRoleOrder)
  yield takeLatest(UPDATE_PERMISSIONS.ACTION, updatePermissions)
  yield takeLatest(CREATE_ROLE.ACTION, createRole)
  yield takeLatest(DELETE_ROLE.ACTION, deleteRole)
}
