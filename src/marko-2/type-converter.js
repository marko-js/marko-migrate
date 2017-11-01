/*
 * Copyright 2011 eBay Software Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';
var builder = require('marko/compiler').builder;
var parseString = require('./parseString');

function convert(value, targetType, allowExpressions) {
    if (value == null || targetType === 'custom' || targetType === 'identifier') {
        return value;
    }

    if (targetType === 'expression' || targetType === 'object' || targetType === 'array') {
        if (value === '') {
            value = 'null';
        }
        return builder.parseExpression(value);
    }

    if (allowExpressions) {
        return parseString(value);
    } else if (targetType === 'string') {
        return value;
    } else if (targetType === 'boolean') {
        value = value.toLowerCase();
        return builder.literal(value === 'true' || value === 'yes' || value === '');
    } else if (targetType === 'float' || targetType === 'double' || targetType === 'number' || targetType === 'integer' || targetType === 'int') {
        if (targetType === 'integer') {
            value = parseInt(value, 10);
        } else {
            value = parseFloat(value);
        }
        return value;
    }
}

exports.convert = convert;