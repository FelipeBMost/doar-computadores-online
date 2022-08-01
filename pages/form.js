import styles from '../styles/Home.module.css';
import axios from 'axios';
import { useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress'; //Spinner do 'loading'

export default function Form() {
  const [numberOfDevices, setNumberOfDevices]  = useState(1); // Número selecionado de aparelhos
  const [loading, setLoading] = useState(false); // Spinner 
  const [zipNotFound, setZipNotFound] = useState(false) // Mensagem de quando o CEP não existe na base de dados
  const [zipInvalid, setZipInvalid] = useState(false) // Mensagem de quando o CEP está incorreto
  const [emailFailure, setEmailFailure] = useState(false)
  // -----------------  Mensagens após enviar o form ------------------- //
  const [success, setSuccess] = useState(false) // Sucesso
  const [failureOne, setFailureOne] = useState(false) // Falha status 400+ 
  const [failureTwo, setFailureTwo] = useState(false)// Falha status 500+ 
  // ------------------ FIM DAS VARIÁVEIS DE ESTADO ---------------------//

  // ----------------- FUNÇÃO DA PESQUISA DE CEP ----------------------- //
  const getAddress = async (zip) => {
    const regExp = new RegExp('^[0-9]{8}$');
    setZipNotFound(false)
    setZipInvalid(false)
      if (regExp.test(zip)){
          setLoading(true)
          
        try {
          let res = await axios.get('https://viacep.com.br/ws/'+ zip + '/json/')

          if(!(res.data.erro)) { 
          // Se achar o CEP, preenche os campos com os dados da API
            document.querySelector('#city').value = res.data.localidade;
            document.querySelector('#state').value = res.data.uf;
            document.querySelector('#streetAddress').value = res.data.logradouro;
            document.querySelector('#neighborhood').value = res.data.bairro;
            document.querySelector('#number').focus();
            setLoading(false);
          } else { 
          // Se o CEP não existe, limpa os campos e mostra mensagem de não achado
            document.querySelector('#city').value = ' ';
            document.querySelector('#state').value = ' ';
            document.querySelector('#streetAddress').value = ' ';
            document.querySelector('#neighborhood').value = ' ';
            setLoading(false);
            setZipNotFound(true)
          }
        }  
        catch (err) {
          setLoading(false)
          setFailureTwo(true)
        }
      } else { 
        // CEP inválido
        setZipInvalid(true)
      }
  }
// --------------------------------- FIM DA FUNÇÃO DE PESQUISA DE CEP ----------------------------- //

// ------------------------------ FUNÇÃO DE ENVIO DO FORMULÁRIO --------------------------- //

  const sendForm = async(e) => {
    e.preventDefault();
    const devices = [];
    let device = {};
    arrayOfDevices.map((el, i) => {
      device = {type: document.querySelector('#type' + i).value, condition: document.querySelector('#condition' + i).value}
      devices.push(device)
    })
    try {
      await axios.post(
        'https://doar-computador-api.herokuapp.com/donation', 
        {
          name: document.querySelector('#name').value,
          mail: document.querySelector('#mail').value,
          phone: document.querySelector('#phone').value,
          zip: document.querySelector('#zip').value,
          city: document.querySelector('#city').value,
          state: document.querySelector('#state').value,
          streetAddress: document.querySelector('#streetAddress').value,
          number: document.querySelector('#number').value,
          complement: document.querySelector('#complement').value,
          neighborhood: document.querySelector('#neighborhood').value,
          deviceCount: parseInt(numberOfDevices),
          devices 
        })
        setSuccess(true)
        window.reload
    }
    catch(err){ 
     if(err.response.status < 500){
       setFailureOne(true)
     } else { 
       setFailureTwo(true)
     }
      
    }
  }
// ------------------------------ FIM DA FUNÇÃO DE ENVIO DO FORMULÁRIO --------------------------- //  

// ------------------- FUNÇÃO PARA FECHAR OS MODAIS AO CLICAR  --------------//
  const handleModal = () => {
    setSuccess(false);
    setFailureOne(false);
    setFailureTwo(false);
  }
// ------------------- FUNÇÃO PARA VERIFICAR SE O EMAIL É VÁLIDO OU NÃO VERIFICAR CASO SEJA DEIXADO EM BRANCO ------------ //
  const handleEmail = (e) => {
    if(e.length > 0) {
      const regExp = new RegExp('^\\w+([\\.-]?\\w+)*@\\w+([\\.-]?\\w+)*(\\.\\w{2,3})+$', 'g');
      if(!(regExp.test(e))){ 
        setEmailFailure(true)
      } else {
        setEmailFailure(false)
      }
    } else {
      setEmailFailure(false)
    }
    
  }
// ------------------ FUNÇÃO QUE GERA MAIS CAMPOS DE APARELHOS QUANDO O USUÁRIO SELECIONA ----------------------------- //
  const arrayOfDevices = [1]; // <-- Ter no mínimo 1 aparelho mesmo que o usuário selecione '0' ou menos através do teclado
  for(let i = 1; i < numberOfDevices; i++) {
    arrayOfDevices.push(0)
  }

  return (
    <div className={styles.hero}> 
      {/* ----------------- MENSAGENS EM MODAIS AO ENVIAR O FORMULÁRIO ---------------------- */}
      {success && <div className={styles.modalBackground} onClick={handleModal}><div className={styles.modalBoxSuccess}>Muito obrigado pela sua doação! Entraremos em contato em breve.</div></div>}
      {failureOne && <div className={styles.modalBackground} onClick={handleModal}><div className={styles.modalBoxFailure}>Favor conferir novamente os dados inseridos. <br /> Podem haver campos faltando ou inválidos.</div></div>}
      {failureTwo && <div className={styles.modalBackground} onClick={handleModal}><div className={styles.modalBoxFailure}>Não foi possível obter resposta do servidor. <br /> Por favor, tente novamente dentro de alguns minutos e caso não consiga, entre em contato com nosso suporte. <br />Sua doação pode mudar muitas vidas!</div></div>}

      {/*------------------ FORMULÁRIO ------------------------- */}
      <form onSubmit={sendForm} className={styles.form} id='form'>

      {/*------------------ DADOS PESSOAIS ------------------------- */}
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Dados pessoais</legend>
          <div className={styles.containerThreeColumns}>
            <group className={styles.group}>
              <label htmlFor='name'>Nome completo: </label>
              <input 
                type='text'
                id='name'
                name='name'
                title='Nome'
                required />
            </group>
            <group className={styles.group}>
              <label htmlFor='mail'>E-mail: (Não obrigatório)</label>
              <input 
                type='mail'
                id='mail'
                name='mail'
                title='mail'
                onBlur={(e) => handleEmail(e.target.value)} />
              { emailFailure && <span className={styles.notFound}>Inválido. Deixe em branco para não cadastrar</span>}
            </group>
            <group className={styles.group}>
              <label htmlFor='phone'>Telefone: DDD+Número</label>
              <input 
                type='phone'
                id='phone'
                name='phone'
                title='Apenas números'
                pattern='[0-9]{12}|[0-9]{11}'
                maxLength={12}
                required  />
            </group>
          </div>

          {/*------------------ ENDEREÇO ------------------------- */}
          <div className={styles.containerTwoColumnsZip}>
            <group className={styles.group}>
              <label htmlFor='zip'>CEP: </label>
              <input 
                type='text'
                id='zip'
                name='zip'
                title='CEP'
                required
                maxLength={'8'}   />
            { zipNotFound && <span className={styles.notFound}>CEP não encontrado</span>}
            { zipInvalid && <span className={styles.notFound}>CEP inválido. Por favor, digite apenas número</span>}
            </group>
            
            <span id='zip-search' className={styles.buttonSearch} onClick={() => getAddress(zip.value)}>
              { // Se estiver carregando mostra spinner, se não estiver carregando mostra texto 'Pesquisar'
              loading ? 
              <CircularProgress className={styles.spinner} role="status">
                <span className="visually-hidden">Loading...</span> {/* Apenas para Screen Readers */}
              </CircularProgress> :  
              'Pesquisar'}
            </span>
            
          </div>
          <div className={styles.containerTwoColumns}>
            <group className={styles.group}>
              <label htmlFor='city'>Cidade: </label>
              <input 
                type='city'
                id='city'
                name='city'
                title='Cidade'
                required
                disabled={loading}    />
            </group>
            <group className={styles.group}>
              <label htmlFor='state'>Estado: </label>
              <input 
                type='state'
                id='state'
                name='state'
                title='Estado'
                required
                disabled={loading}    />
            </group>
            <group className={styles.group}>
              <label htmlFor='streetAddress'>Rua: </label>
              <input 
                type='streetAddress'
                id='streetAddress'
                name='streetAddress'
                title='Rua'
                required
                disabled={loading}    />
            </group>
            <group className={styles.group}>
              <label htmlFor='neighborhood'>Bairro: </label>
              <input 
                type='neighborhood'
                id='neighborhood'
                name='neighborhood'
                title='Bairro'
                required
                disabled={loading}    />
            </group>
            <group className={styles.group}>
              <label htmlFor='number'>Número: </label>
              <input 
                type='text'
              id='number'
              name='number'
              title='Número'
              required    />
            </group>
            <group className={styles.group}> 
              <label htmlFor='complement'>Complemento: </label>
              <input 
                type='complement'
              id='complement'
              name='complement'
              title='Complemento'    />
            </group>
          </div>
        </fieldset>

{/* ------------------------------------ DEVICES ------------------------------------*/}
        
        <fieldset id='aparelhos' className={styles.fieldset}>
          <legend className={styles.legend}>Aparelhos: </legend>
          <div>
            <group id={styles.deviceCount} className={styles.group}>
              <label htmlFor='deviceCount'>Número de aparelhos: </label>
              <input 
                type='number'
                min='1'
                defaultValue={1}
                id='deviceCount'
                name='deviceCount'
                title='Número de aparelhos'
                onChange={(e) => setNumberOfDevices((e.target.value))}    />
            </group>
          </div>
          {arrayOfDevices.map((el, i) => 
          <div className={styles.containerTwoColumns}key={i}>
            <group className={styles.group}>
              <label htmlFor='deviceType'>Aparelho {i+1}: </label>
              <select 
                id={'type' + i}
                type='text'
                name='type'
                title='Tipo' 
                required
                >
                <option value='notebook'>Notebook</option>
                <option value='desktop'>Desktop</option>
                <option value='netbook'>Netbook</option>
                <option value='screen'>Monitor</option>
                <option value='printer'>Impressora</option>
                <option value='scanner'>Scanner</option>
              </select>
            </group>
            <group className={styles.group}>
              <label htmlFor='deviceCondition'>Estado de conservação: </label>
              <select 
                id={'condition' + i}
                type='text'
                name='condition'
                title='Condição' 
                required
                >
                <option value='working'>Tem todas as partes, liga e funciona normalmente</option>
                <option value='notWorking'>Tem todas as partes, mas não liga mais</option>
                <option value='broken'>Faltam peças, funciona só as vezes ou está quebrado</option>
              </select>
            </group>
          </div>
          )}       
        </fieldset>
        <button type="submit" className={styles.buttonSubmit}>Enviar</button>
      </form>
    </div>
  )
}