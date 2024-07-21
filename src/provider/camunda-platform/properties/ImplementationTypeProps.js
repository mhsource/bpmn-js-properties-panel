import {
  sortBy
} from 'min-dash';

import { SelectEntry, isSelectEntryEdited } from '@bpmn-io/properties-panel';

import {
  useService
} from '../../../hooks';

import {
  getImplementationType,
  isExternalCapable,
  getServiceTaskLikeBusinessObject
} from '../utils/ImplementationTypeUtils';

const DELEGATE_PROPS = {
  'camunda:class': undefined,
  'camunda:expression': undefined,
  'camunda:delegateExpression': undefined,
  'camunda:resultVariable': undefined
};

const EXTERNAL_CAPABLE_PROPS = {
  'camunda:type': undefined,
  'camunda:topic': undefined
};

const IMPLEMENTATION_TYPE_NONE_LABEL = '<none>',
      IMPLEMENTATION_TYPE_JAVA_LABEL = 'Java class',
      IMPLEMENTATION_TYPE_EXPRESSION_LABEL = 'Expression',
      IMPLEMENTATION_TYPE_DELEGATE_LABEL = 'Delegate expression',
      IMPLEMENTATION_TYPE_DMN_LABEL = 'DMN',
      IMPLEMENTATION_TYPE_EXTERNAL_LABEL = 'Serviço Externo',
      IMPLEMENTATION_TYPE_CONNECTOR_LABEL = 'Connector';


export function ImplementationTypeProps(props) {
  return [
    {
      id: 'implementationType',
      component: ImplementationType,
      isEdited: isSelectEntryEdited
    },
  ];
}


function ImplementationType(props) {
  const { element } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');

  const getValue = () => {
    return getImplementationType(element) || '';
  };

  const setValue = (value) => {

    const oldType = getImplementationType(element);
    const businessObject = getServiceTaskLikeBusinessObject(element);
    const commands = [];

    let updatedProperties = DELEGATE_PROPS;

    // (1) class, expression, delegateExpression
    if (isDelegateType(value)) {

      updatedProperties = {
        ...updatedProperties,
        [value]: isDelegateType(oldType) ? businessObject.get(`camunda:${oldType}`) : ''
      };

    }

    // (3) external
    // Note: error event definition elements got cleaned up in modeling behavior
    // cf. https://github.com/camunda/camunda-bpmn-js/blob/main/lib/camunda-platform/features/modeling/behavior/DeleteErrorEventDefinitionBehavior.js
    if (isExternalCapable(businessObject)) {
      updatedProperties = {
        ...updatedProperties,
        ...EXTERNAL_CAPABLE_PROPS
      };

      if (value === 'external') {
        updatedProperties = {
          ...updatedProperties,
          'camunda:type': 'external',
          'camunda:topic': ''
        };
      }
    }

    // (5) collect all property updates
    commands.push(UpdateModdlePropertiesCommand(element, businessObject, updatedProperties));

    // (6) commit all updates
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };

  const getOptions = () => {

    const options = [
    ];

    options.push({ value: 'external', label: translate(IMPLEMENTATION_TYPE_EXTERNAL_LABEL) });




    return sortByPriority(options);
  };

  return SelectEntry({
    element,
    id: 'implementationType',
    label: translate('Tipo de implementação'),
    getValue,
    setValue,
    getOptions
  });
}


// helper ///////////////////////

function isDelegateType(type) {
  return [ 'class', 'expression', 'delegateExpression' ].includes(type);
}

function UpdateModdlePropertiesCommand(element, businessObject, newProperties) {
  return {
    cmd: 'element.updateModdleProperties',
    context: {
      element,
      moddleElement: businessObject,
      properties: newProperties
    }
  };
}

function sortByPriority(options) {
  const priorities = {
    [IMPLEMENTATION_TYPE_NONE_LABEL]: 0,
    [IMPLEMENTATION_TYPE_JAVA_LABEL]: 3,
    [IMPLEMENTATION_TYPE_EXPRESSION_LABEL]: 4,
    [IMPLEMENTATION_TYPE_DELEGATE_LABEL]: 5,
    [IMPLEMENTATION_TYPE_DMN_LABEL]: 1,
    [IMPLEMENTATION_TYPE_EXTERNAL_LABEL]: 2,
    [IMPLEMENTATION_TYPE_CONNECTOR_LABEL]: 6
  };

  return sortBy(options, o => priorities[o.label]);
}
