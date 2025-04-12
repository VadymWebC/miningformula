var code = "with ({a:5, b:0}) {var c=5}"
function doIt(string, context="global", specials=null) {
	var checkChar = 0
	var command = ""
	while (checkChar<string.length) {
		command += string[checkChar]===" "?"":string[checkChar]
		switch (command) {
			case "with":
				// Определяем аргумент-объект
				var stringArg = string.indexOf("(", checkChar)+1
				for (var i=0, needs=1, getted=0; i<string.length; i++) {
					//Получаем тело аргумента
					if (string[stringArg+i]==="(") needs++
					if (string[stringArg+i]===")") getted++
					if (getted===needs) {
						//Конвертация тела в объект
						if (!doIt[string.substring(stringArg, stringArg+i)]) {
							doIt[string.substring(stringArg, stringArg+i)] = new Function("return "+string.substring(stringArg, stringArg+i))
						}
						var objectArg = doIt[string.substring(stringArg, stringArg+i)]()
						if (typeof objectArg!=="object") throw Error("Недопустимый тип")
						var fromBody = stringArg+i+1
						break;
					}
				}
				//Обработка тела with
				for (var i=string.indexOf("{", fromBody)+1, needs=1, getted=0; i<string.length; i++) {
					//Получаем тело
					if (string[i]==="{") needs++
					if (string[i]==="}") getted++
					if (getted===needs) {
						for (var j=0; string[fromBody+j]===" "; j++) {}
						var stringBody = string.substring(j+1+fromBody, i).split(";")
					}
				}
				//Исполняем код
				for(var i=0; i<stringBody.length; i++) {
					doIt(stringBody[i], "with", objectArg)
				}
				return;
			case "var": 
				var identifier = string.substring(string.indexOf("var")+4, string.indexOf("=")-(string[string.indexOf("=")-1]===" "?1:0))
				if (context==="global") {
					globalThis[identifier] = new Function("return "+string.substring(string.indexOf("=")+1))()
				} else if (context==="with") {
					if (!doIt[string.substring(string.indexOf("=")+1)]) {
						doIt[string.substring(string.indexOf("=")+1)]=new Function("return "+string.substring(string.indexOf("=")+1))()
						 //new Function("return "+string.substring(string.indexOf("=")+1))()
					}
					specials[identifier] = doIt[string.substring(string.indexOf("=")+1)]
				}
				break;
			case "console":
				for (var i=string.indexOf("console")+7, subI=""; i<string.length; i++) {
					if (string[i]!==" ") {
						subI+=string[i]
						switch (subI) {
							case ".log":
								var stringBody = string.substring(string.indexOf(".log(")+5, string.lastIndexOf(")"))
								if (!doIt[stringBody]) {
									doIt[stringBody] = new Function("specials", `var {${Object.keys(specials).join(",")}} = specials; return ${stringBody}`)
								}
								console.log(doIt[stringBody])()//new Function("specials", `var {${Object.keys(specials).join(",")}} = specials; return ${stringBody}`)(specials))
								return;
							default: break;
						}
					}
				}
				return;
			default: break;
		}
		checkChar++
	}
}
doIt(code)
console.time("with")
for (let i=0; i<50_000; i++) {
	eval("with ({a:5, b:0}) {var c=5}")
}
console.timeEnd("with")
console.time("doIt")
for (let i=0; i<50_000; i++) {
	doIt(code)
}
console.timeEnd("doIt")
/*
console.log(doIt("var suka=5"))
console.log(doIt("var padla = 'suka'"))
*/