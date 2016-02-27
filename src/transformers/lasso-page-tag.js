'use strict';

exports.transform = function(el) {
    let packagePathValue = el.getAttributeValue('package-path');
    if (packagePathValue) {
        if (packagePathValue.type === 'Literal') {
            var packagePath = packagePathValue.value;
            if (packagePath && !packagePath.startsWith('.')) {
                packagePath = './' + packagePath;
                packagePathValue.value = packagePath;
            }
        }
    }
};