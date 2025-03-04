import { Config, filters, Literal, Query } from '../../Configuration';
import { batchParameter } from '../../helpers/BatchParameter';
import { returningQuery } from '../../helpers/ReturningQuery';
import { sanitizeIdentifier } from '../../helpers/SanitizeIdentifier';
import { whereQuery } from '../../helpers/WhereQuery';
import { combineLiterals } from '../../utils/CombineLiterals';

interface BatchRemove extends Config {
    returnCols: string | string[];
    primaryKey: string | string[];
    permanentFilters?: filters;
}

type QueryFunction = (ids: Array<string | number | Literal<any>>) => Query;

export const batchRemove = ({
    table,
    returnCols,
    primaryKey = ['id'],
    permanentFilters = {},
}: BatchRemove): QueryFunction => {
    const returning = returningQuery(returnCols);
    const selector = Array.isArray(primaryKey) ? primaryKey : [primaryKey];
    const idSanitizer = sanitizeIdentifier(selector);

    return ids => {
        const cleanIds = ids.map<object>(idSanitizer);
        const parameters = batchParameter(selector)(cleanIds);
        const { value: where, log } = whereQuery(
            {
                ...combineLiterals(cleanIds),
                ...permanentFilters,
            },
            [...selector, ...Object.keys(permanentFilters)],
        ).read();

        log.map(console.debug);

        const sql = `DELETE FROM ${table} ${where} ${returning};`;

        return {
            parameters: {
                ...parameters,
                ...permanentFilters,
            },
            sql,
        };
    };
};
