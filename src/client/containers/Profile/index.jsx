import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { observer } from 'mobx-react'
import { makeObservable, observable } from 'mobx'
import axios from 'axios'
import moment from 'moment-timezone'

import { saveProfile, genMFA } from 'actions/accounts'
import { showModal, hideModal, setSessionUser } from 'actions/common'

import PageTitle from 'components/PageTitle'
import PageContent from 'components/PageContent'
import TruCard from 'components/TruCard'
import Avatar from 'components/Avatar/Avatar'
import Button from 'components/Button'
import Spacer from 'components/Spacer'
import TruTabWrapper from 'components/TruTabs/TruTabWrapper'
import TruTabSelectors from 'components/TruTabs/TruTabSelectors'
import TruTabSelector from 'components/TruTabs/TruTabSelector'
import TruTabSection from 'components/TruTabs/TruTabSection'
import Input from 'components/Input'
import QRCode from 'components/QRCode'
import TruAccordion from 'components/TruAccordion'
import SingleSelect from 'components/SingleSelect'

import helpers from 'lib/helpers'
import RGrid from 'components/RGrid'

@observer
class ProfileContainer extends React.Component {
  @observable editingProfile = false

  @observable fullname = null
  @observable title = null
  @observable email = null
  @observable workNumber = null
  @observable mobileNumber = null
  @observable companyName = null
  @observable facebookUrl = null
  @observable linkedinUrl = null
  @observable twitterUrl = null

  // Security
  // -- Password
  @observable currentPassword = null
  @observable newPassword = null
  @observable confirmPassword = null
  // -- Two Factor
  @observable l2Key = null
  @observable l2URI = null
  @observable l2Step2 = null
  @observable l2ShowCantSeeQR = null
  @observable l2VerifyText = null

  // Prefs
  @observable timezone = null

  constructor (props) {
    super(props)

    makeObservable(this)
  }

  componentDidMount () {
    // This will update the profile with the latest values
    this.props.setSessionUser()
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    // This should load initial state values
    if (prevProps.sessionUser !== this.props.sessionUser) {
      this.fullname = this.props.sessionUser.fullname
      this.title = this.props.sessionUser.title
      this.email = this.props.sessionUser.email
      this.workNumber = this.props.sessionUser.workNumber
      this.mobileNumber = this.props.sessionUser.mobileNumber
      this.companyName = this.props.sessionUser.companyName
      this.facebookUrl = this.props.sessionUser.facebookUrl
      this.linkedinUrl = this.props.sessionUser.linkedinUrl
      this.twitterUrl = this.props.sessionUser.twitterUrl

      if (this.props.sessionUser.preferences) {
        this.timezone = this.props.sessionUser.preferences.timezone
      }
    }
  }

  _validateEmail (email) {
    if (!email) return false
    return email
      .toString()
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      )
  }

  _getTimezones () {
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

  onTimezoneSelectChange = e => {
    this.timezone = e.target.value
  }

  onSaveProfileClicked = e => {
    e.preventDefault()
    if ((this.fullname && this.fullname.length) > 50 || (this.email && this.email.length > 50)) {
      helpers.UI.showSnackbar('Слижком большая длина', true)
      return
    }

    if (!this._validateEmail(this.email)) {
      helpers.UI.showSnackbar('Неверный Email', true)
      return
    }

    this.props
      .saveProfile({
        _id: this.props.sessionUser._id,
        username: this.props.sessionUser.username,

        fullname: this.fullname,
        title: this.title,
        workNumber: this.workNumber,
        mobileNumber: this.mobileNumber,
        companyName: this.companyName,
        facebookUrl: this.facebookUrl,
        linkedinUrl: this.linkedinUrl,
        twitterUrl: this.twitterUrl,
        preferences: {
          timezone: this.timezone
        }
      })
      .then(() => {
        this.editingProfile = false
        helpers.forceSessionUpdate().then(() => {
          this.props.setSessionUser()
          helpers.UI.showSnackbar('Профиль успешно сохранен.')
        })
      })
  }

  onUpdatePasswordClicked = e => {
    e.preventDefault()

    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      helpers.UI.showSnackbar('Неверные данные формы')
      return
    }

    if (this.currentPassword.length < 4 || this.newPassword.length < 4 || this.confirmPassword.length < 4) {
      helpers.UI.showSnackbar('Пароль слишком короткий', true)
      return
    }

    if (this.currentPassword.length > 255 || this.newPassword.length > 255 || this.confirmPassword.length > 255) {
      helpers.UI.showSnackbar('Пароль слишком длинный', true)
      return
    }

    axios
      .post('/api/v2/accounts/profile/update-password', {
        currentPassword: this.currentPassword,
        newPassword: this.newPassword,
        confirmPassword: this.confirmPassword
      })
      .then(res => {
        if (res.data && res.data.success) {
          helpers.UI.showSnackbar('Пароль изменен.')
          setTimeout(() => {
            window.location.reload()
          }, 1000)
        }
      })
      .catch(error => {
        let errorMsg = 'Неверный запрос'
        if (error && error.response && error.response.data && error.response.data.error)
          errorMsg = error.response.data.error

        helpers.UI.showSnackbar(errorMsg, true)
      })
  }

  onEnableMFAClicked = e => {
    e.preventDefault()
    this.props
      .genMFA({
        _id: this.props.sessionUser._id,
        username: this.props.sessionUser.username
      })
      .then(res => {
        this.l2Key = res.key
        this.l2URI = res.uri
        this.l2Step2 = true
      })
  }

  onVerifyMFAClicked = e => {
    e.preventDefault()
    axios
      .post('/api/v2/accounts/profile/mfa/verify', {
        tOTPKey: this.l2Key,
        code: this.l2VerifyText
      })
      .then(res => {
        if (res.data && res.data.success) {
          // Refresh Session User
          this.props.setSessionUser()
          this.l2Step2 = null
          this.l2ShowCantSeeQR = null
        }
      })
      .catch(e => {
        if (e.response && e.response.data && e.response.data.error) {
          helpers.UI.showSnackbar(e.response.data.error, true)
        }
      })
  }

  onDisableMFAClicked = e => {
    e.preventDefault()
    const onVerifyComplete = success => {
      if (success) {
        this.l2Step2 = null
        this.l2ShowCantSeeQR = null
        this.props.setSessionUser()
      }
    }

    this.props.showModal('PASSWORD_PROMPT', { user: this.props.sessionUser, onVerifyComplete })
  }

  render () {
    // return (
    //   <div>
    //     <PageTitle title={'Dashboard'} />
    //     <PageContent>
    //       <RGrid />
    //     </PageContent>
    //   </div>
    // )
    if (!this.props.sessionUser) return <div />

    const InfoItem = ({ label, prop, paddingLeft, paddingRight, isRequired, onUpdate }) => {
      return (
        <div style={{ width: '33%', paddingRight: paddingRight, paddingLeft: paddingLeft }}>
          <label style={{ cursor: 'default', fontSize: '13px', fontWeight: 400, marginRight: 15 }}>
            {label}
            {isRequired && <span style={{ color: 'red' }}>*</span>}
          </label>
          <Spacer top={5} bottom={0} />
          {this.editingProfile && <Input defaultValue={prop || ''} onChange={onUpdate} />}
          {!this.editingProfile && (
            <p
              style={{
                fontSize: '14px',
                lineHeight: '21px',
                margin: 0,
                fontWeight: 600,
                textOverflow: 'ellipsis',
                overflow: 'hidden'
              }}
            >
              {prop || '-'}
            </p>
          )}
        </div>
      )
    }

    return (
      <>
        <PageTitle title={'Профиль'} />
        <PageContent>
          <TruCard
            header={<div />}
            hover={false}
            content={
              <>
                <div className={'uk-position-relative'}>
                  <Avatar
                    userId={this.props.sessionUser._id}
                    image={this.props.sessionUser.image}
                    enableImageUpload={true}
                    username={this.props.sessionUser.username}
                    socket={this.props.socket}
                    showOnlineBubble={false}
                    showBorder={true}
                    size={72}
                  />
                  <div className={'uk-clearfix'} style={{ paddingLeft: 85 }}>
                    <h2
                      className={'ml-15'}
                      style={{ fontSize: 24, lineHeight: '36px', letterSpacing: '0.5px', fontWeight: 600 }}
                    >
                      {this.props.sessionUser.fullname}
                    </h2>
                    <p className={'ml-15'} style={{ lineHeight: '9px' }}>
                      <span style={{ marginRight: 10 }}>{this.props.sessionUser.email}</span>|
                      <span style={{ margin: '0 10px' }}>{this.props.sessionUser.title}</span>|
                      <span
                        style={{
                          boxSizing: 'border-box',
                          margin: '0 10px',
                          padding: '5px 8px',
                          background: '#d9eeda',
                          border: '1px solid #b5dfb7',
                          borderRadius: 3,
                          color: '#4caf50'
                        }}
                      >
                        {this.props.sessionUser.role.name.toUpperCase()}
                      </span>
                    </p>
                  </div>
                  <Button
                    text={'Редактировать профиль'}
                    small={true}
                    waves={true}
                    style={'primary'}
                    styleOverride={{ position: 'absolute', top: '5px', right: 5 }}
                    disabled={this.editingProfile}
                    onClick={() => {
                      this.fullname = this.props.sessionUser.fullname
                      this.editingProfile = !this.editingProfile
                    }}
                  />
                </div>
              </>
            }
          />
          <Spacer />
          <TruCard
            hover={false}
            content={
              <div>
                <TruTabWrapper style={{ padding: '0' }}>
                  <TruTabSelectors showTrack={true}>
                    <TruTabSelector selectorId={0} label={'Профиль'} active={true} />
                    <TruTabSelector selectorId={1} label={'Безопасность'} />
                    <TruTabSelector selectorId={2} label={'Настройки'} />
                  </TruTabSelectors>
                  <TruTabSection sectionId={0} active={true} style={{ minHeight: 480 }}>
                    <div style={{ maxWidth: 900, padding: '10px 25px' }}>
                      <h4 style={{ marginBottom: 15 }}>Work Information</h4>
                      <div style={{ display: 'flex' }}>
                        <InfoItem
                          label={'Имя'}
                          prop={this.props.sessionUser.fullname}
                          paddingLeft={0}
                          paddingRight={30}
                          isRequired={true}
                          onUpdate={val => (this.fullname = val)}
                        />
                        <InfoItem
                          label={'Фамилия'}
                          prop={this.props.sessionUser.title}
                          paddingLeft={30}
                          paddingRight={30}
                          onUpdate={val => (this.title = val)}
                        />
                        <InfoItem
                          label={'Компания'}
                          prop={this.props.sessionUser.companyName}
                          paddingRight={0}
                          paddingLeft={30}
                          onUpdate={val => (this.companyName = val)}
                        />
                      </div>
                      <div style={{ display: 'flex', marginTop: 25 }}>
                        <InfoItem
                          label={'Рабочий телефон'}
                          prop={this.props.sessionUser.workNumber}
                          paddingRight={30}
                          paddingLeft={0}
                          onUpdate={val => (this.workNumber = val)}
                        />
                        <InfoItem
                          label={'Мобильный'}
                          prop={this.props.sessionUser.mobileNumber}
                          paddingLeft={30}
                          paddingRight={0}
                          onUpdate={val => (this.mobileNumber = val)}
                        />
                      </div>
                      <Spacer top={25} bottom={25} showBorder={true} />
                      <h4 style={{ marginBottom: 15 }}>Other Information</h4>
                      <div style={{ display: 'flex', marginTop: 25 }}>
                        <InfoItem
                          label={'VK'}
                          prop={this.props.sessionUser.facebookUrl}
                          paddingLeft={0}
                          paddingRight={30}
                          onUpdate={val => (this.facebookUrl = val)}
                        />
                        <InfoItem
                          label={'LinkedIn'}
                          prop={this.props.sessionUser.linkedinUrl}
                          paddingLeft={30}
                          paddingRight={30}
                          onUpdate={val => (this.linkedinUrl = val)}
                        />
                        <InfoItem
                          label={'Х'}
                          prop={this.props.sessionUser.twitterUrl}
                          paddingLeft={30}
                          paddingRight={0}
                          onUpdate={val => (this.twitterUrl = val)}
                        />
                      </div>
                      {this.editingProfile && (
                        <div className={'uk-display-flex uk-margin-large-top'}>
                          <Button
                            text={'Сохранить'}
                            style={'primary'}
                            small={true}
                            onClick={e => this.onSaveProfileClicked(e)}
                          />
                          <Button text={'Отмена'} small={true} onClick={() => (this.editingProfile = false)} />
                        </div>
                      )}
                    </div>
                  </TruTabSection>
                  <TruTabSection sectionId={1} style={{ minHeight: 480 }}>
                    <div style={{ maxWidth: 600, padding: '25px 0' }}>
                      <TruAccordion
                        headerContent={'Сменить пароль'}
                        content={
                          <div>
                            <form onSubmit={e => this.onUpdatePasswordClicked(e)}>
                              <div
                                className={'uk-alert uk-alert-warning'}
                                style={{ display: 'flex', alignItems: 'center' }}
                              >
                                <i className='material-icons mr-10' style={{ opacity: 0.5 }}>
                                  info
                                </i>
                                <p style={{ lineHeight: '18px' }}>
                                 После смены пароля вы выйдете из всех сеансов.
                                </p>
                              </div>
                              <div>
                                <div className={'uk-margin-medium-bottom'}>
                                  <label>Текущий пароль</label>
                                  <Input type={'password'} onChange={v => (this.currentPassword = v)} />
                                </div>
                                <div className={'uk-margin-medium-bottom'}>
                                  <label>Новый пароль</label>
                                  <Input type={'password'} onChange={v => (this.newPassword = v)} />
                                </div>
                                <div className={'uk-margin-medium-bottom'}>
                                  <label>Подтверждение пароля</label>
                                  <Input type={'password'} onChange={v => (this.confirmPassword = v)} />
                                </div>
                              </div>
                              <div>
                                <Button
                                  type={'submit'}
                                  text={'Обновить пароль'}
                                  style={'primary'}
                                  small={true}
                                  extraClass={'uk-width-1-1'}
                                  onClick={e => this.onUpdatePasswordClicked(e)}
                                />
                              </div>
                            </form>
                          </div>
                        }
                      />
                      <TruAccordion
                        headerContent={'Двухфакторная авторизация'}
                        content={
                          <div>
                            {!this.props.sessionUser.hasL2Auth && (
                              <div>
                                {!this.l2Step2 && (
                                  <div>
                                    <h4 style={{ fontWeight: 500 }}>Двухфакторная аутентификация пока не включена</h4>
                                    <p style={{ fontSize: '12px', fontWeight: 400 }}>
                                    Включение двухфакторной аутентификации добавляет дополнительный уровень безопасности вашим
                                    аккаунтам. После включения вам потребуется ввести как пароль, так и
                                    код аутентификации для входа в свой аккаунт. После успешного
                                    включения двухфакторной аутентификации вы не сможете войти в систему, пока не введете
                                    правильный код.
                                    </p>
                                    <div>
                                      <Button
                                        text={'Включить'}
                                        style={'primary'}
                                        small={true}
                                        waves={true}
                                        onClick={e => this.onEnableMFAClicked(e)}
                                      />
                                    </div>
                                  </div>
                                )}
                                {this.l2Step2 && (
                                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <div style={{ width: 400 }}>
                                      <div style={{ display: 'flex', marginTop: 15, flexDirection: 'column' }}>
                                        <p style={{ fontWeight: 500, marginBottom: 40 }}>
                                          Отсканируйте QR-код ниже с помощью любого приложения-аутентификатора, например Authy, Google Authenticator, LastPass Authenticator, Microsoft Authenticator
                                        </p>
                                        <div style={{ alignSelf: 'center', marginBottom: 40 }}>
                                          <div>
                                            <QRCode
                                              size={180}
                                              code={this.l2URI || 'INVALID_CODE'}
                                              css={{ marginBottom: 5 }}
                                            />
                                            <a
                                              href='#'
                                              style={{
                                                display: 'inline-block',
                                                fontSize: '12px',
                                                width: '100%',
                                                textAlign: 'right'
                                              }}
                                              onClick={e => {
                                                e.preventDefault()
                                                this.l2ShowCantSeeQR = true
                                              }}
                                            >
                                             Не можете отсканировать QR-код?
                                            </a>
                                          </div>
                                        </div>
                                        {this.l2ShowCantSeeQR && (
                                          <div style={{ alignSelf: 'center', marginBottom: 15 }}>
                                            <p style={{ fontSize: '13px' }}>
                                             Если вы не можете отсканировать QR-код, откройте приложение-аутентификатор и выберите опцию, которая позволяет вручную ввести указанный ниже ключ.
                                            </p>
                                            <p style={{ textAlign: 'center' }}>
                                              <span
                                                style={{
                                                  display: 'inline-block',
                                                  padding: '5px 25px',
                                                  background: 'white',
                                                  color: 'black',
                                                  fontWeight: 500,
                                                  border: '1px solid rgba(0,0,0,0.1)'
                                                }}
                                              >
                                                {this.l2Key}
                                              </span>
                                            </p>
                                          </div>
                                        )}
                                        <p style={{ fontWeight: 500 }}>
                                          После сканирования QR-кода введите 6-значный проверочный код ниже, чтобы активировать двухфакторную аутентификацию в вашей учетной записи.
                                        </p>
                                        <label>Проверочный код</label>
                                        <Input type={'text'} onChange={val => (this.l2VerifyText = val)} />
                                        <div style={{ marginTop: 25 }}>
                                          <Button
                                            text={'Проверить и продолжить'}
                                            style={'primary'}
                                            small={true}
                                            waves={true}
                                            extraClass={'uk-width-1-1'}
                                            onClick={e => this.onVerifyMFAClicked(e)}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                            {this.props.sessionUser.hasL2Auth && (
                              <div>
                                <h4 style={{ fontWeight: 500 }}>
                                Двухфакторная аутентификация {' '}
                                  <span className={'uk-text-success'} style={{ fontWeight: 600 }}>
                                    включена
                                  </span>
                                </h4>
                                <p style={{ fontSize: '12px' }}>
                                  Отключив двухфакторную аутентификацию, ваша учетная запись будет защищена только вашим паролем.
                                </p>
                                <div>
                                  <Button
                                    text={'Отключить'}
                                    style={'danger'}
                                    small={true}
                                    onClick={e => this.onDisableMFAClicked(e)}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        }
                      />
                    </div>
                  </TruTabSection>
                  <TruTabSection sectionId={2} style={{ minHeight: 480 }}>
                    <div style={{ maxWidth: 450, padding: '10px 25px' }}>
                      <h4 style={{ marginBottom: 15 }}>Настройки интерфейса</h4>
                      <div className={'uk-clearfix uk-margin-large-bottom'}>
                        <label style={{ fontSize: '13px' }}>Часовой пояс</label>
                        <SingleSelect
                          items={this._getTimezones()}
                          defaultValue={this.timezone || undefined}
                          onSelectChange={e => this.onTimezoneSelectChange(e)}
                        />
                      </div>
                      <div>
                        <Button
                          text={'Сохранить настройки'}
                          style={'primary'}
                          small={true}
                          type={'button'}
                          onClick={e => this.onSaveProfileClicked(e)}
                        />
                      </div>
                    </div>
                  </TruTabSection>
                </TruTabWrapper>
              </div>
            }
          />
        </PageContent>
      </>
    )
  }
}

ProfileContainer.propTypes = {
  sessionUser: PropTypes.object,
  setSessionUser: PropTypes.func.isRequired,
  socket: PropTypes.object.isRequired,
  showModal: PropTypes.func.isRequired,
  hideModal: PropTypes.func.isRequired,
  saveProfile: PropTypes.func.isRequired,
  genMFA: PropTypes.func.isRequired
}

const mapStateToProps = state => ({
  sessionUser: state.shared.sessionUser,
  socket: state.shared.socket
})

export default connect(mapStateToProps, { showModal, hideModal, saveProfile, setSessionUser, genMFA })(ProfileContainer)
