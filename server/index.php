<?php

$formato = isset($_POST['formato']) ? strtoupper($_POST['formato']) : NULL;
$qtd_registros = isset($_POST['qtd_registros']) ? $_POST['qtd_registros'] : NULL;
  
try {
	/* #ONLINE */
	/*$usuario = 'kennedy_mestrado';
	$senha = 'm3str@d0';
    $banco = 'mysql:host=localhost;dbname=kennedy_mestrado';*/

	/* #LOCAL */
	$usuario = 'root';
	$senha ='';
    $banco = 'mysql:host=localhost;dbname=employees';


    $conn = new PDO($banco, $usuario, $senha);
    $dados = $conn->query('SELECT * FROM employees LIMIT '.$qtd_registros);
    $dados = $conn->query('SELECT * FROM employees LIMIT '.$qtd_registros);

    switch ($formato) {
    	case 'XML':
			header('Content-type: application/xml');
		    $xml = '<?xml version="1.0" encoding="UTF-8"?>';
		   
		    $xml .= "<empregados>";
		    while ($linha = $dados->fetch(PDO::FETCH_ASSOC)) {
		    	$xml .= "<empregado>";
		    		$xml .= "<matricula>".$linha['emp_no']."</matricula>";
		    		$xml .= "<dataNascimento>".$linha['birth_date']."</dataNascimento>";
		    		$xml .= "<nome>".$linha['first_name']."</nome>";
		    		$xml .= "<sobrenome>".$linha['last_name']."</sobrenome>";
		    		$xml .= "<genero>".$linha['gender']."</genero>";
		    		$xml .= "<dataAdmissao>".$linha['hire_date']."</dataAdmissao>";
		    	$xml .= "</empregado>";
		    	
		    }
		    $xml .= "</empregados>";
		    echo $xml;
    		break;
    	
    	case 'JSON:PHP':
	    	$result = $dados->fetchAll(PDO::FETCH_ASSOC);
			header("Content-type: application/json; charset=utf-8"); 
			echo json_encode($result);
			//echo json_last_error(); 
			break;

		case 'JSON':
			header("Content-type: application/json; charset=utf-8");

			$resultado =  "[";
			while ($linha = $dados->fetch(PDO::FETCH_ASSOC)) {
				$resultado .= "{\"nome\":\"{$linha['first_name']}\",\"sobrenome\":\"{$linha['last_name']}\",\"nascimento\":\"{$linha['birth_date']}\",\"admissao\":\"{$linha['hire_date']}\",\"genero\":\"{$linha['gender']}\",\"matricula\":\"{$linha['emp_no']}\"},";
			}
			$resultado = substr($resultado,0,-1)."]";
			echo $resultado;
			break;

		case 'CSV':
			$retorno = "matricula,dataNascimento,nome,sobrenome,genero,dataAdmissao;";
			while ($linha = $dados->fetch(PDO::FETCH_ASSOC)) {
		    	$retorno .= $linha['emp_no'].",".$linha['birth_date'].",".$linha['first_name'].",".$linha['last_name'].",".$linha['gender'].",".$linha['hire_date'].";";
		    }
		    echo substr($retorno, 0, -1);
			break;
		case 'TABELA': 
			while ($linha = $dados->fetch(PDO::FETCH_ASSOC)) {    	
	    		echo 
		    	"<table>
		            <thead>
		                <tr>
		                    <th colspan=\"2\"> 
		                    	{$linha['first_name']} {$linha['last_name']}
		                    </th>
		                </tr>
		            </thead>
		            <tbody>
		                <tr>
		                    <td class=\"campo\">Matrícula:</td>
		                    <td> {$linha['emp_no']} </td>
		                </tr>
		                <tr>
		                    <td class=\"campo\">Nascimento:</td>
		                    <td> {$linha['birth_date']} </td>
		                </tr>
		                <tr>
		                    <td class=\"campo\">Gênero:</td>
		                    <td> {$linha['gender']} </td>
		                </tr>
		                <tr>
		                    <td class=\"campo\">Admissão:</td>
		                    <td> {$linha['hire_date']} </td>
		                </tr>
		            </tbody>
		        </table>";
		    }
    		break;
    		case 'LISTA':
    			while ($linha = $dados->fetch(PDO::FETCH_ASSOC)) {
		    		echo "
					<ul>
						<li> {$linha['first_name']} {$linha['last_name']} </li>
						<li>
							<span>Matrícula:</span>
							{$linha['emp_no']}
						</li>
						<li>
							<span>Nascimento</span>
							{$linha['birth_date']}
						</li>
						<li>
							<span>Gênero:</span>
							{$linha['gender']}
						</li>
						<li>
							<span>Admissão:</span>
							{$linha['hire_date']}
						</li>
					</ul>";
				}
    		break;
    		default:
    			echo "FORMATO NÃO SUPORTADO!";
    		break;
    }
} catch(PDOException $e) {
    echo 'ERROR: ' . $e->getMessage();
}
?>