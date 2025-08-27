const _ = require('lodash');

const envToJson = (json) => {
  const variables = _.get(json, 'variables', []);
  const parentEnvironmentUid = _.get(json, 'parentEnvironmentUid', null);
  
  const vars = variables
    .filter((variable) => !variable.secret)
    .map((variable) => {
      const { name, value, enabled } = variable;
      const prefix = enabled ? '' : '~';
      return `  ${prefix}${name}: ${value}`;
    });

  const secretVars = variables
    .filter((variable) => variable.secret)
    .map((variable) => {
      const { name, enabled } = variable;
      const prefix = enabled ? '' : '~';
      return `  ${prefix}${name}`;
    });

  let output = '';
  
  // Add parent environment if it exists
  if (parentEnvironmentUid) {
    output += `inherit: ${parentEnvironmentUid}

`;
  }

  if (!variables || !variables.length) {
    output += `vars {
}
`;
    return output;
  }

  if (vars.length) {
    output += `vars {
${vars.join('\n')}
}
`;
  }

  if (secretVars.length) {
    output += `vars:secret [
${secretVars.join(',\n')}
]
`;
  }

  return output;
};

module.exports = envToJson;
