import React from 'react'
import PropTypes from 'prop-types'
import { makeObservable, observable } from 'mobx'
import { observer } from 'mobx-react'
import { connect } from 'react-redux'

import { fetchTeams, unloadTeams } from 'actions/teams'
import { fetchGroups, unloadGroups } from 'actions/groups'
import { updateDepartment } from 'actions/departments'

import BaseModal from 'containers/Modals/BaseModal'

import helpers from 'lib/helpers'
import $ from 'jquery'
import Button from 'components/Button'
import MultiSelect from 'components/MultiSelect'

@observer
class EditDepartmentModal extends React.Component {
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

    this.name = this.props.department.get('name')
    this.allGroups = this.props.department.get('allGroups')
    this.publicGroups = this.allGroups ? true : this.props.department.get('publicGroups')

    helpers.UI.inputs()
    helpers.UI.reRenderInputs()
    helpers.formvalidator()
  }

  componentDidUpdate () {
    helpers.UI.reRenderInputs()
    if (this.allGroups) this.groupSelect.selectAll()
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

    const payload = {
      _id: this.props.department.get('_id'),
      name: this.name,
      teams: this.teamsSelect.getSelected(),
      allGroups: this.allGroups,
      publicGroups: this.publicGroups,
      groups: this.allGroups ? [] : this.groupSelect.getSelected()
    }

    this.props.updateDepartment(payload)
  }

  render () {
    const { department } = this.props
    const departmentTeams = department.get('teams')
    const departmentGroups = department.get('groups')
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
          <h2>Редактирование отдела: {department.get('name')}</h2>
        </div>
        <form className={'uk-form-stacked'} onSubmit={e => this.onFormSubmit(e)}>
          <div className={'uk-margin-medium-bottom'}>
            <label>Наименование отдела</label>
            <input
              type='text'
              className={'md-input'}
              value={this.name}
              onChange={e => this.onInputChange(e)}
              data-validation='length'
              data-validation-length={'min2'}
              data-validation-error-msg={'Пожалуйста введите верное имя отдела. (Имя должно содержать минимум 2 символа)'}
            />
          </div>
          <div className={'uk-margin-medium-bottom'}>
            <label style={{ marginBottom: 5 }}>Команды</label>
            <MultiSelect
              items={mappedTeams}
              initialSelected={departmentTeams ? departmentTeams.map(d => d.get('_id')).toArray() : []}
              onChange={() => {}}
              ref={r => (this.teamsSelect = r)}
            />
          </div>
          <hr />
          <div className={'uk-margin-medium-bottom uk-clearfix'}>
            <div className='uk-float-left'>
              <h4 style={{ paddingLeft: 2 }}>Доступ ко всем текущим и новым группам клиентов?</h4>
            </div>
            <div className='uk-float-right md-switch md-green' style={{ marginTop: 5 }}>
              <label>
                Yes
                <input
                  type='checkbox'
                  checked={this.allGroups}
                  onChange={e => {
                    this.allGroups = e.target.checked
                    this.publicGroups = this.allGroups
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
                Yes
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
              initialSelected={departmentGroups ? departmentGroups.map(d => d.get('_id')).toArray() : []}
              ref={r => (this.groupSelect = r)}
              disabled={this.allGroups}
            />
          </div>
          <div className='uk-modal-footer uk-text-right'>
            <Button text={'Закрыть'} flat={true} waves={true} extraClass={'uk-modal-close'} />
            <Button text={'Сохранить отдел'} flat={true} waves={true} style={'primary'} type={'submit'} />
          </div>
        </form>
      </BaseModal>
    )
  }
}

EditDepartmentModal.propTypes = {
  department: PropTypes.object.isRequired,
  updateDepartment: PropTypes.func.isRequired,
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

export default connect(mapStateToProps, { updateDepartment, fetchTeams, unloadTeams, fetchGroups, unloadGroups })(
  EditDepartmentModal
)
