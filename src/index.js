const DECIMAL_FUN_NAME = 'Decimal';
const OPERATIONS_MAP = {
	'+': 'add',
	'-': 'sub',
	'*': 'mul',
	'/': 'div'
};
const OPERATIONS = Object.keys(OPERATIONS_MAP);

export default function ({ template: template }) {
	const preOperationAST = template(`new ${DECIMAL_FUN_NAME}(LEFT).OPERATION(RIGHT).toNumber()`); //将0.1+0.2转化为addCalc的模板
    const requireAST = template(`import ${DECIMAL_FUN_NAME} from 'decimal.js'`); //es module方式引入相应函数的模板

	return {
		visitor: {
			Program: {
				exit: function (path) {
                    //调用方法，往子节点body中添加 const Decimal = require('decimal.js')
					path.unshiftContainer('body', requireAST());
				}
			},
			BinaryExpression: {
				exit: function (path) {
                    //节点 path 的 operator 属性 例如，如果 path 是一个二元表达式节点，比如 a + b，那么 path.node.operator 的值将是字符串 "+"
					const operator = path.node.operator;
					if (OPERATIONS.includes(operator)) {
                        //判断操作符的两边是否是数字自变量
						if (path.node.left.type == 'NumericLiteral' && path.node.right.type == 'NumericLiteral') {
                            //替换当前节点
							path.replaceWith(
								preOperationAST({
									LEFT: path.node.left,
									RIGHT: path.node.right,
									OPERATION: OPERATIONS_MAP[operator]
								})
							);
						}
					}
				}
			}
		}
	};
}

