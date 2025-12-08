
 * @param {string} identifier - CPF ou CNPJ.
 * @param {string} password - Senha.
 * @param {string} userType - 'associado' ou 'comerciante'.
 * @returns {object|null} O objeto de resposta do login (com token), ou null em caso de falha de credencial (401).
 */
async function loginUser(identifier, password, userType) {
    const endpoint = userType === 'associado' 
        ? `${API_BASE_URL}/auth/login`
        : `${API_BASE_URL}/auth/comercio/login`; 
    
    const requestBody = {
        identifier: identifier, 
        senha: password(        )
    };

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (response.ok) {
            return response.json();
        } else if (response.status === 401 || response.status === 404) {
            return null; 
        } else {
            console.error(`API Error (${response.status}):`, await response.text());
            throw new Error(`Erro no servidor: ${response.status}`);
        }

    } catch (error) {
        console.error('Network or Parse Error:', error);
        throw error;
    }
}