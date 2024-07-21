import { Group } from '@bpmn-io/properties-panel';

import { findIndex } from 'min-dash';

import { arrayMoveMutable } from 'array-move';

import {
  ErrorProps,
  EscalationProps,
  IdProps,
  ImplementationProps,
  MultiInstanceProps,
  ProcessProps,
  TimerProps
} from './properties';

const LOW_PRIORITY = 500;

const CAMUNDA_PLATFORM_GROUPS = [

  ImplementationGroup,

];

/**
 * Provides `camunda` namespace properties.
 *
 * @example
 * ```javascript
 * import BpmnModeler from 'bpmn-js/lib/Modeler';
 * import {
 *   BpmnPropertiesPanelModule,
 *   BpmnPropertiesProviderModule,
 *   CamundaPlatformPropertiesProviderModule
 * } from 'bpmn-js-properties-panel';
 *
 * const modeler = new BpmnModeler({
 *   container: '#canvas',
 *   propertiesPanel: {
 *     parent: '#properties'
 *   },
 *   additionalModules: [
 *     BpmnPropertiesPanelModule,
 *     BpmnPropertiesProviderModule,
 *     CamundaPlatformPropertiesProviderModule
 *   ]
 * });
 * ```
 */
export default class CamundaPlatformPropertiesProvider {

  constructor(propertiesPanel, injector) {
    propertiesPanel.registerProvider(LOW_PRIORITY, this);

    this._injector = injector;
  }

  getGroups(element) {
    return (groups) => {

      // (1) add Camunda Platform specific groups
      groups = groups.concat(this._getGroups(element));

      // (2) update existing groups with Camunda Platform specific properties
      updateGeneralGroup(groups, element);
      updateErrorGroup(groups, element);
      updateEscalationGroup(groups, element);
      updateMultiInstanceGroup(groups, element);
      updateTimerGroup(groups, element);

      // (3) move groups given specific priorities
      moveImplementationGroup(groups);

      return groups;
    };
  }

  _getGroups(element) {
    const groups = CAMUNDA_PLATFORM_GROUPS.map(createGroup => createGroup(element, this._injector));

    // contract: if a group returns null, it should not be displayed at all
    return groups.filter(group => group !== null);
  }
}

CamundaPlatformPropertiesProvider.$inject = [ 'propertiesPanel', 'injector' ];

/**
 * This ensures the <Implementation> group always locates after <Documentation>
 */
function moveImplementationGroup(groups) {
  const documentationGroupIdx = findGroupIndex(groups, 'documentation');

  if (documentationGroupIdx < 0) {
    return;
  }

  return moveGroup(groups, 'CamundaPlatform__Implementation', documentationGroupIdx + 1);
}

function updateGeneralGroup(groups, element) {

  const generalGroup = findGroup(groups, 'general');

  if (!generalGroup) {
    return;
  }

  const { entries } = generalGroup;

  // (1) replace id with camunda id
  const idIndex = findIndex(entries, (entry) => entry.id === 'id');
  entries.splice(idIndex, 1, ...IdProps());

  // (2) replace processId with camunda processId (if existing)
  const processIdIndex = findIndex(entries, (entry) => entry.id === 'processId');
  if (processIdIndex && processIdIndex >= 0) {
    entries.splice(processIdIndex, 1, ...ProcessProps({ element }));
  }

}

function updateErrorGroup(groups, element) {
  const errorGroup = findGroup(groups, 'error');

  if (!errorGroup) {
    return;
  }

  const { entries } = errorGroup;

  ErrorProps({ element, entries });
}

function updateMultiInstanceGroup(groups, element) {
  const multiInstanceGroup = findGroup(groups, 'multiInstance');

  if (!multiInstanceGroup) {
    return;
  }

  const { entries } = multiInstanceGroup;

  MultiInstanceProps({ element, entries });
}

function updateEscalationGroup(groups, element) {
  const escalationGroup = findGroup(groups, 'escalation');

  if (!escalationGroup) {
    return;
  }

  const { entries } = escalationGroup;

  EscalationProps({ element, entries });
}

function updateTimerGroup(groups, element) {
  const timerEventGroup = findGroup(groups, 'timer');

  if (!timerEventGroup) {
    return;
  }

  timerEventGroup.entries = [
    ...TimerProps({ element })
  ];
}

function ImplementationGroup(element, injector) {
  const translate = injector.get('translate');

  const group = {
    label: translate('Implementação'),
    id: 'CamundaPlatform__Implementation',
    component: Group,
    entries: [
      ...ImplementationProps({ element })
    ]
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

// helper /////////////////////

function findGroup(groups, id) {
  return groups.find(g => g.id === id);
}

function findGroupIndex(groups, id) {
  return findIndex(groups, g => g.id === id);
}

function moveGroup(groups, id, position) {
  const groupIndex = findGroupIndex(groups, id);

  if (position < 0 || groupIndex < 0) {
    return;
  }

  return arrayMoveMutable(groups, groupIndex, position);
}
