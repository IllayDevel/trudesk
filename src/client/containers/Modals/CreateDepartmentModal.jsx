import React from 'react'
import PropTypes from 'prop-types'
import { makeObservable, observable } from 'mobx'
import { observer } from 'mobx-react'
import { connect } from 'react-redux'

import { fetchTeams, unloadTeams } from 'actions/teams'
import { fetchGroups, unloadGroups } from 'actions/groups'
import { createDepartment } from 'actions/departments'

import BaseModal from 'containers/Modals/BaseModal'

import helpers from 'lib/helpers'
import $ from 'jquery'
import Button from 'components/Button'
import MultiSelect from 'components/MultiSelect'

@observer
class CreateDepartmentModal extends React.Component {
  @observable name = ''
  @observable allGroups = false
  @observable publicGroups = false

  constructor (props) {
    super(props)

    makeObservable(this)
  }

  componentDidMount () {
    this.props.fetchTeams()
    this.props.fetchGroups({ type: 'all' })

    helpers.UI.inputs()
    helpers.UI.reRenderInputs()
    helpers.formvalidator()
  }

  componentDidUpdate () {
    helpers.UI.reRenderInputs()
  }

  componentWillUnmount () {
    this.props.unloadTeams()
    this.props.unloadGroups()
  }

  onInputChange (e) {
    this.name = e.target.value
  }

  onFormSubmit (e) {
    e.preventDefault()
    const $form = $(e.target)
    if (!$form.isValid(null, null, false)) return false

    if (!this.allGroups && !this.publicGroups && this.groupSelect.getSelected() == null) {
      helpers.UI.showSnackbar('Невозможно создать отдел, если не выбрана группа или не включены все группы!', true)
      return false
    }

    if (this.teamsSelect.getSelected() == null) {
      helpers.UI.showSnackbar('Невозможно создать отдел без выбора команды!', true)
      return false
    }

    const payload = {
      name: this.name,
      teams: this.teamsSelect.getSelected(),
      allGroups: this.allGroups,
      publicGroups: this.publicGroups,
      groups: this.allGroups ? [] : this.groupSelect.getSelected()
    }

    this.props.createDepartment(payload)
  }

  render () {
    const mappedTeams = this.props.teams
      .map(team => {
        return { text: team.get('name'), value: team.get('_id') }
      })
      .toArray()

    const mappedGroups = this.props.groups
      .map(group => {
        return { text: group.get('name'), value: group.get('_id') }
      })
      .toArray()

    return (
      <BaseModal {...this.props} options={{ bgclose: false }}>
        <div className={'mb-25'}>
          <h2>Создать отдел</h2>
        </div>
        <form className={'uk-form-stacked'} onSubmit={e => this.onFormSubmit(e)}>
          <div className={'uk-margin-medium-bottom'}>
            <label>Наименование</label>
            <input
              type='text'
              className={'md-input'}
              value={this.name}
              onChange={e => this.onInputChange(e)}
              data-validation='length'
              data-validation-length={'min2'}
              data-validation-error-msg={'Наименование отдела должно содержать не менее 2 символов'}
            />
          </div>
          <div className={'uk-margin-medium-bottom'}>
            <label style={{ marginBottom: 5 }}>Команды</label>
            <MultiSelect items={mappedTeams} onChange={() => {}} ref={r => (this.teamsSelect = r)} />
          </div>
          <hr />
          <div className={'uk-margin-medium-bottom uk-clearfix'}>
            <div className='uk-float-left'>
              <h4 style={{ paddingLeft: 2 }}>Доступ ко всем текущим и новым группам клиентов?</h4>
            </div>
            <div className='uk-float-right md-switch md-green' style={{ marginTop: 5 }}>
              <label>
                Да
                <input
                  type='checkbox'
                  value={this.allGroups}
                  onChange={e => {
                    this.allGroups = e.target.checked
                    if (this.allGroups) this.groupSelect.selectAll()
                    else this.groupSelect.deselectAll()
                  }}
                />
                <span className={'lever'} />
              </label>
            </div>
          </div>
          <div className={'uk-margin-medium-bottom uk-clearfix'}>
            <div className='uk-float-left'>
              <h4 style={{ paddingLeft: 2 }}>Доступ ко всем текущим и новым публичным группам?</h4>
            </div>
            <div className='uk-float-right md-switch md-green' style={{ marginTop: 1 }}>
              <label>
                Да
                <input
                  type='checkbox'
                  checked={this.publicGroups}
                  onChange={e => {
                    this.publicGroups = e.target.checked
                  }}
                />
                <span className={'lever'} />
              </label>
            </div>
          </div>
          <div className={'uk-margin-medium-bottom'}>
            <label style={{ marginBottom: 5 }}>Группы клиентов</label>
            <MultiSelect
              items={mappedGroups}
              onChange={() => {}}
              ref={r => (this.groupSelect = r)}
              disabled={this.allGroups}
            />
          </div>
          <div className='uk-modal-footer uk-text-right'>
            <Button text={'Закрыть'} flat={true} waves={true} extraClass={'uk-modal-close'} />
            <Button text={'Создать отдел'} flat={true} waves={true} style={'primary'} type={'submit'} />
          </div>
        </form>
      </BaseModal>
    )
  }
}

CreateDepartmentModal.propTypes = {
  createDepartment: PropTypes.func.isRequired,
  fetchTeams: PropTypes.func.isRequired,
  unloadTeams: PropTypes.func.isRequired,
  fetchGroups: PropTypes.func.isRequired,
  unloadGroups: PropTypes.func.isRequired,
  teams: PropTypes.object.isRequired,
  groups: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
  teams: state.teamsState.teams,
  groups: state.groupsState.groups
})

export default connect(mapStateToProps, { createDepartment, fetchTeams, unloadTeams, fetchGroups, unloadGroups })(
  CreateDepartmentModal
)
