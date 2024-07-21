import { TextFieldEntry, isTextFieldEntryEdited } from '@bpmn-io/properties-panel';

import { ImplementationTypeProps } from './ImplementationTypeProps';

import {
  useService
} from '../../../hooks';

import {
  getServiceTaskLikeBusinessObject
} from '../utils/ImplementationTypeUtils';


export function ImplementationProps(props) {
  const {
    element
  } = props;

  if (!getServiceTaskLikeBusinessObject(element)) {
    return [];
  }

  // (1) display implementation type select
  const entries = [
    ...ImplementationTypeProps({ element })
  ];

  entries.push(
    {
      id: 'externalTopic',
      component: Topic,
      isEdited: isTextFieldEntryEdited
    }
  );

  return entries;
}

export function JavaClass(props) {
  const {
    element,
    businessObject = getServiceTaskLikeBusinessObject(element),
    id = 'javaClass'
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return businessObject.get('camunda:class');
  };

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: {
        'camunda:class': value || ''
      }
    });
  };

  return TextFieldEntry({
    element,
    id,
    label: translate('Java class'),
    getValue,
    setValue,
    debounce
  });
}

export function Expression(props) {
  const {
    element,
    businessObject = getServiceTaskLikeBusinessObject(element),
    id = 'expression'
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return businessObject.get('camunda:expression');
  };

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: {
        'camunda:expression': value || ''
      }
    });
  };

  return TextFieldEntry({
    element,
    id,
    label: translate('Expression'),
    getValue,
    setValue,
    debounce
  });
}

export function DelegateExpression(props) {
  const {
    element,
    businessObject = getServiceTaskLikeBusinessObject(element),
    id = 'delegateExpression'
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return businessObject.get('camunda:delegateExpression');
  };

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: {
        'camunda:delegateExpression': value || ''
      }
    });
  };

  return TextFieldEntry({
    element,
    id,
    label: translate('Delegate expression'),
    getValue,
    setValue,
    debounce
  });
}

function Topic(props) {
  const { element } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const businessObject = getServiceTaskLikeBusinessObject(element);

  const getValue = () => {
    return businessObject.get('camunda:topic');
  };

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: {
        'camunda:topic': value
      }
    });
  };

  return TextFieldEntry({
    element,
    id: 'externalTopic',
    label: translate('Nome do serviço'),
    getValue,
    setValue,
    debounce
  });
}
