import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { updateSetting } from 'actions/settings'
import { observer } from 'mobx-react'
import { makeObservable, observable } from 'mobx'
import Log from '../../../logger'
import axios from 'axios'

import Button from 'components/Button'
import SettingItem from 'components/Settings/SettingItem'
import EnableSwitch from 'components/Settings/EnableSwitch'
import SplitSettingsPanel from 'components/Settings/SplitSettingsPanel'

import helpers from 'lib/helpers'
import Zone from 'components/ZoneBox/zone'
import ZoneBox from 'components/ZoneBox'

const templateBody = ({ template, handleSaveSubject, handleOpenEditor }) => (
  <div>
    <h3 className={'font-light mb-5'}>Описание шаблона</h3>
    <p className='mb-10' style={{ fontSize: '13px' }}>
      {template.description}
    </p>
    <hr className='uk-margin-medium-bottom' />
    <form onSubmit={handleSaveSubject}>
      <input name={'id'} type='hidden' value={template._id} />
      <div className='uk-input-group'>
        <div className='md-input-wrapper'>
          <label>Тема письма</label>
          <input name={'subject'} type='text' className={'md-input'} defaultValue={template.subject} />
        </div>
        <span className='uk-input-group-addon'>
          <Button type={'submit'} text={'Сохранить'} small={true} />
        </span>
      </div>
    </form>

    <Zone extraClass={'uk-margin-medium-top'}>
      <ZoneBox>
        <div className={'uk-float-left'}>
          <h6 style={{ margin: 0, fontSize: '16px', lineHeight: '14px' }}>Изменить шаблон (отключено)</h6>
          <h5 className={'uk-text-muted'} style={{ margin: '2px 0 0 0', fontSize: '12px' }}>
            Настроить шаблон — в настоящее время отключено
          </h5>
        </div>
        <div className='uk-float-right uk-width-1-3 uk-clearfix'>
          <div className='uk-width-1-1 uk-float-right' style={{ textAlign: 'right' }}>
            <button
              className={'md-btn md-btn-small right disabled'}
              style={{ textTransform: 'none' }}
              onClick={handleOpenEditor}
              disabled={true}
            >
              Открыть редактор
            </button>
          </div>
        </div>
      </ZoneBox>
    </Zone>
  </div>
)

templateBody.propTypes = {
  template: PropTypes.object.isRequired,
  handleSaveSubject: PropTypes.func.isRequired,
  handleOpenEditor: PropTypes.func.isRequired
}

@observer
class MailerSettingsTemplates extends React.Component {
  @observable betaEnabled = false
  @observable templates = []

  constructor (props) {
    super(props)
    makeObservable(this)
  }

  componentDidMount () {
    helpers.UI.inputs()
  }

  componentDidUpdate (prevProps) {
    helpers.UI.reRenderInputs()
    if (prevProps.settings !== this.props.settings) {
      if (this.betaEnabled !== this.getSetting('emailBeta')) this.betaEnabled = this.getSetting('emailBeta')
      if (this.props.settings.get('mailTemplates').toArray() !== this.templates) {
        this.templates = this.props.settings.get('mailTemplates').toArray()
      }
    }
  }

  getSetting (name) {
    return this.props.settings.getIn(['settings', name, 'value']) !== undefined
      ? this.props.settings.getIn(['settings', name, 'value'])
      : ''
  }

  onEmailBetaChange (e) {
    const self = this
    const val = e.target.checked
    this.props.updateSetting({ name: 'beta:email', value: val, stateName: 'betaEmail', noSnackbar: true }).then(() => {
      self.betaEnabled = val
    })
  }

  onSaveSubject (e) {
    e.preventDefault()
    const subject = e.target.subject
    if (!subject) return
    axios
      .put(`/api/v1/settings/mailer/template/${e.target.id.value}`, {
        subject: subject.value
      })
      .then(res => {
        if (res.data && res.data.success) helpers.UI.showSnackbar('Template subject saved successfully')
      })
      .catch(error => {
        const errorText = error.response ? error.response.error : error
        helpers.UI.showSnackbar(`Error: ${errorText}`, true)
        Log.error(errorText, error)
      })
  }

  static onOpenEditor (e, name) {
    e.preventDefault()
    const url = `/settings/editor/${name}/`
    History.pushState(null, null, url)
  }

  mapTemplateMenu () {
    return this.templates.map((template, idx) => {
      const templateJS = template.toJS()
      return {
        key: idx,
        title: template.get('displayName'),
        bodyComponent: templateBody({
          template: templateJS,
          handleSaveSubject: e => this.onSaveSubject(e),
          handleOpenEditor: e => MailerSettingsTemplates.onOpenEditor(e, templateJS.name)
        })
      }
    })
  }

  render () {
    const mappedValues = this.mapTemplateMenu()
    return (
      <div>
        <SettingItem
          title={'Включить шаблоны для электронной почты'}
          subtitle={
            <div>
              Новая система уведомлений по электронной почте в настоящее время находится в стадии бета-тестирования.
            </div>
          }
          component={
            <EnableSwitch
              stateName={'emailBeta'}
              label={'Включить'}
              checked={this.betaEnabled}
              onChange={e => this.onEmailBetaChange(e)}
            />
          }
        />
        <SplitSettingsPanel
          title={'Шаблоны уведомлений'}
          subtitle={
            <div>
             Настройте шаблоны уведомлений по электронной почте.
              <strong> Примечание: не все шаблоны были преобразованы для бета-версии.</strong>
            </div>
          }
          rightComponent={<h4 className={'uk-display-block uk-text-danger mt-20 mr-20'}>BETA</h4>}
          menuItems={mappedValues}
        />
      </div>
    )
  }
}

MailerSettingsTemplates.propTypes = {
  updateSetting: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
  settings: state.settings.settings
})

export default connect(mapStateToProps, { updateSetting })(MailerSettingsTemplates)
