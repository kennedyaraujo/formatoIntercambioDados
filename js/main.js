function $(seletor){
	document.querySelector(seletor);
}
var util = {
	criarElemento: function(tag, conteudo, configuracoes){
		var elemento = document.createElement(tag);
		elemento.appendChild(document.createTextNode(conteudo));

		if(typeof configuracoes != "undefined"){
			var propriedades = configuracoes.split(",");
			for(i=0, qtd=propriedades.length; i<qtd; i++){
				var valores = propriedades[i].split(":");
				elemento.setAttribute(valores[0], valores[1]);
			}
		}

		return elemento;
	}
}
var app = {
	formato: null,
	metodo: null,
	temporizacao : {
		inicio: null,
		teminoDaRequisicao:null,
		terminoDoTratamento:null,
		inclusaoDoConteudo:null
	},
	carregar:function(){
		document.querySelector('a.enviar').addEventListener('click',app.carregarDados);
	},carregarDados:function(){
		app.temporizacao.inicio = null,
		app.temporizacao.teminoDaRequisicao = null,
		app.temporizacao.terminoDoTratamento = null,
		app.temporizacao.inclusaoDoConteudo = null;

	
		var requisicao = new XMLHttpRequest();
		app.formato = document.querySelector('.formato').value;
		app.metodo = document.querySelector('.metodo').value;
		/* =============== URL DO SERVIDOR ================== */
		//var url = 'http://kennedyaraujo.com/mestrado/formato-de-dados/server/index.php',		
		var url = 'http://localhost/artigo/server/index.php',
		qtd_registros= document.querySelector('.qtd-registros').value,
		content_type = app.formato == 'xml' ? 'text/xml' : 'application/x-www-form-urlencoded';
		requisicao.open('POST', url, true);

		app.temporizacao.inicio = performance.now();
		requisicao.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		requisicao.onreadystatechange = function ()
		{

		    if (this.readyState == 4)
		    {
		    	app.temporizacao.teminoDaRequisicao = performance.now();
				var dados = null;
				switch(app.formato){
					case 'xml':
						var parser = new DOMParser();
						var doc = parser.parseFromString(this.responseText, "application/xml");						

						if(app.metodo == "inserirDireto"){
							document.getElementById("lista").innerHTML = app.inserirXMLDireto(doc);
						}else{
							var dados = app.tratarXML(doc);
							app.temporizacao.terminoDoTratamento = performance.now();
							if(app.metodo == "inserirElementos"){
								var secao = app.formatarObjetoEmTabela(dados);
								document.getElementById("lista").appendChild(secao);
							}else if(app.metodo == "inserirHTML"){
								document.getElementById("lista").innerHTML = app.formatarObjetoEmString(dados);
							}
						}
					break;
					case 'csv':						
						//console.log(dados);
						if(app.metodo == "inserirDireto"){
							document.getElementById("lista").innerHTML = app.inserirCSVDireto(this.responseText);
						}else{
							dados = app.tratarCSV(this.responseText);
							app.temporizacao.terminoDoTratamento = performance.now();
							if(app.metodo == "inserirElementos"){
								var secao = app.formatarObjetoEmTabela(dados);
								document.getElementById("lista").appendChild(secao);
							}else if(app.metodo == "inserirHTML"){
								document.getElementById("lista").innerHTML = app.formatarObjetoEmString(dados);
							}
						}
					break;
					case 'json:php':
					case 'json':
						var parser = new DOMParser();
						var dados = JSON.parse(this.responseText);
						app.temporizacao.terminoDoTratamento = performance.now();

						if(app.metodo == "inserirElementos"){
							var secao = app.formatarObjetoEmTabela(dados);
							document.getElementById("lista").appendChild(secao);
						}else if(app.metodo == "inserirHTML"){
							document.getElementById("lista").innerHTML = app.formatarObjetoEmString(dados);
						}else if(app.metodo == 'inserirElementosDiretamenteNoDom'){
							app.formatarObjetoInserindoDiretamente(dados);
						}
					break;
					case 'lista':
						document.getElementById("lista").innerHTML = this.responseText;
					break;
					case 'tabela':
						document.getElementById("lista").innerHTML = this.responseText;
					break;
				}
				app.temporizacao.inclusaoDoConteudo = performance.now();

				var tempo = "Tempo da requisição:"+(app.temporizacao.teminoDaRequisicao-app.temporizacao.inicio)+"<br>";
				
				console.log(app.temporizacao.terminoDoTratamento);

				if(app.temporizacao.terminoDoTratamento == null){
					tempo += "Tempo da inserção:"+(app.temporizacao.inclusaoDoConteudo-app.temporizacao.teminoDaRequisicao)+"<br>";
				}else{
					tempo += "Tempo da conversão:"+(app.temporizacao.terminoDoTratamento-app.temporizacao.teminoDaRequisicao)+"<br>";
					tempo += "Tempo da inserção:"+(app.temporizacao.inclusaoDoConteudo-app.temporizacao.terminoDoTratamento)+"<br>";
				}
				
				document.getElementById("tempo").innerHTML = tempo;
 		    }
		}
		
		var dados = 'qtd_registros='+qtd_registros+'&formato='+app.formato;
		requisicao.send(dados);
		//return false;
	},
	tratarCSV: function(dados){
		var arrayBase = dados.split(";"),
			arrayIndices = arrayBase[0].split(','),
			arrayDados = [];

			for(i=1, qtdi=arrayBase.length; i<qtdi; i++){
				arrayDados[i-1] = {};

				linha = arrayBase[i].split(',');

				for(j=0, qtdj=arrayIndices.length; j<qtdj; j++){
					Object.defineProperty(arrayDados[i-1],arrayIndices[j],{
					  value: linha[j],
					  configurable: true
					});
				}
			}
			
			return arrayDados;
	},
	inserirCSVDireto: function(dados){
		var arrayBase = dados.split(";"),
			arrayIndices = arrayBase[0].split(','),
			arrayDados = [];

		var string = "<section>";

		for(i=1, qtdi=arrayBase.length; i<qtdi; i++){
			arrayDados[i-1] = {};

			linha = arrayBase[i].split(',');

			string+= "<table>";
			string+= "<thead><tr><th colspan=\"2\">"+linha[2]+" "+linha[3]+"</th></tr></thead>";
			string+= "<tbody>";
			string+= "<tr><td class=\"campo\">Matrícula:</td><td>"+linha[0]+"</td></tr>";
			string+= "<tr><td class=\"campo\">Nascimento:</td><td>"+linha[1]+"</td></tr>";
			string+= "<tr><td class=\"campo\">Gênero:</td><td>"+linha[4]+"</td></tr>";
			string+= "<tr><td class=\"campo\">Admissão:</td><td>"+linha[5]+"</td></tr>";
			string+= "</tbody></table>";
		}

		string+="</section>";
		return string;

	},
	tratarXML: function(dados){
		var arrayBase = dados.childNodes[0].childNodes,
			arrayDados = [];

			for(i=0, qtdi=arrayBase.length; i<qtdi; i++){
				arrayDados[i] = {};

				linha = arrayBase[i].childNodes;

				for(j=0, qtdj=linha.length; j<qtdj; j++){
					Object.defineProperty(arrayDados[i],linha[j].nodeName,{
					  value: linha[j].textContent,
					  configurable: true
					});
				}
			}
			return arrayDados;
	},
	inserirXMLDireto:function(dados){

		var arrayBase = dados.childNodes[0].childNodes,
			string = "<section>";

		for(i=0, qtdi=arrayBase.length; i<qtdi; i++){
			var linha = arrayBase[i].childNodes;
			
			string+= "<table>";
			string+= "<thead><tr><th colspan=\"2\">"+linha[2].innerHTML+" "+linha[3].innerHTML+"</th></tr></thead>";
			string+= "<tbody>";
			string+= "<tr><td class=\"campo\">Matrícula:</td><td>"+linha[0].innerHTML+"</td></tr>";
			string+= "<tr><td class=\"campo\">Nascimento:</td><td>"+linha[1].innerHTML+"</td></tr>";
			string+= "<tr><td class=\"campo\">Gênero:</td><td>"+linha[4].innerHTML+"</td></tr>";
			string+= "<tr><td class=\"campo\">Admissão:</td><td>"+linha[5].innerHTML+"</td></tr>";
			string+= "</tbody></table>";
		}

		string+="</section>";
		return string;

	},
	criarTabelaParaObjeto:function(objeto){

		var tabela = document.createElement("table"),
		cabecalho = document.createElement("thead"),
		linha = document.createElement("tr"),
		titulo = util.criarElemento("th",objeto.nome+" "+objeto.sobrenome,"colspan:2");
		linha.appendChild(titulo);
		cabecalho.appendChild(linha);
		tabela.appendChild(cabecalho);

		var corpo = document.createElement("tbody"),
		ln1 = document.createElement("tr");
		ln1.appendChild(util.criarElemento("td","Matrícula","class:campo"));
		ln1.appendChild(util.criarElemento("td",objeto.matricula));
		corpo.appendChild(ln1);

		var ln2 = document.createElement("tr");
		ln2.appendChild(util.criarElemento("td","Nascimento","class:campo"));
		ln2.appendChild(util.criarElemento("td",objeto.dataNascimento));
		corpo.appendChild(ln2);

		var ln3 = document.createElement("tr");
		ln3.appendChild(util.criarElemento("td","Gênero","class:campo"));
		ln3.appendChild(util.criarElemento("td",objeto.genero));
		corpo.appendChild(ln3);
		
		var ln4 = document.createElement("tr");
		ln4.appendChild(util.criarElemento("td","Admissão","class:campo"));
		ln4.appendChild(util.criarElemento("td",objeto.dataAdmissao));
		corpo.appendChild(ln4);

		tabela.appendChild(corpo);

		return tabela;

	},
	formatarObjetoEmTabela: function(dados){

		var secao = document.createElement("section");

		for(var i=0, qtd=dados.length; i<qtd; i++){
			objeto = dados[i];

			var tabela = app.criarTabelaParaObjeto(objeto);
			
			secao.appendChild(tabela);

		}		
		return secao;
	},
	formatarObjetoInserindoDiretamente: function(dados){

		//var secao = document.createElement("section");

		

		for(var i=0, qtd=dados.length; i<qtd; i++){
			objeto = dados[i];
			//transformar objeto em tabela
			var tabela = app.criarTabelaParaObjeto(objeto);
			//inserir tabela na tag main pelo id list
			document.getElementById("lista").appendChild(tabela);			

		}		
	},
	formatarObjetoEmString:function(dados){
		var string = "<section>";

		for(var i=0, qtd=dados.length; i<qtd; i++){
			console.log(i);
			dado = dados[i];
			string+= "<table>";
			string+= "<thead><tr><th colspan=\"2\">"+dado.nome+" "+dado.sobrenome+"</th></tr></thead>";
			string+= "<tbody>";
			string+= "<tr><td class=\"campo\">Matrícula:</td><td>"+dado.matricula+"</td></tr>";
			string+= "<tr><td class=\"campo\">Nascimento:</td><td>"+dado.dataNascimento+"</td></tr>";
			string+= "<tr><td class=\"campo\">Gênero:</td><td>"+dado.genero+"</td></tr>";
			string+= "<tr><td class=\"campo\">Admissão:</td><td>"+dado.dataAdmissao+"</td></tr>";
			string+= "</tbody></table>";
		}

		string+="</section>";
		return string;
	}
}
app.carregar();