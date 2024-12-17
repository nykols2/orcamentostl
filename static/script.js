document.getElementById('uploadForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    

    const fileInput = document.getElementById('stlFile');
    const scaleInput = document.getElementById('scale');
    const infillInput = document.getElementById('infill');
    const materialInput = document.getElementById('material'); // Pega a seleção do material

    if (!fileInput.files.length) {
        alert('Please select a file!');
        return;
    }

    // Exibir o gif de carregamento
    document.getElementById('loadingContainer').style.display = 'block';
    document.getElementById('results').innerHTML = '';  // Limpar resultados anteriores


    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('scale', scaleInput.value);

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (response.ok) {
            const infillValue = infillInput.value;
            const materialValue = materialInput.value;  // Pega o valor do material selecionado
            const volume = result.volume_cm3;

            // Define a densidade com base no material
            let density = 1.04; // Padrão para ABS
            if (materialValue === "PLA") {
                density = 1.24; // Densidade do PLA
            }

            // Calcula o peso com base na densidade escolhida
            let weightDisplay = (volume * density).toFixed(2);
            let volumeDisplay = volume.toFixed(2);



            // Função para converter mm para cm
            function convertToCm(dimensions) {
                return {
                    x: (dimensions.x / 10).toFixed(2),
                    y: (dimensions.y / 10).toFixed(2),
                    z: (dimensions.z / 10).toFixed(2)
                };
            }
            
            // Ajuste para o infill de 30% com base em novos volumes
            if (infillValue === "30") {
                let adjustedWeight = weightDisplay;
                let adjustedVolume = volumeDisplay;

                if (result.volume_cm3 >= 1 && result.volume_cm3 <= 50) {
                    adjustedWeight = (weightDisplay * 0.80).toFixed(2);
                    adjustedVolume = (volumeDisplay * 0.80).toFixed(2);
                } else if (result.volume_cm3 > 50 && result.volume_cm3 <= 100) {
                    adjustedWeight = (weightDisplay * 0.70).toFixed(2);
                    adjustedVolume = (volumeDisplay * 0.70).toFixed(2);
                } else if (result.volume_cm3 > 100 && result.volume_cm3 <= 150) {
                    adjustedWeight = (weightDisplay * 0.60).toFixed(2);
                    adjustedVolume = (volumeDisplay * 0.60).toFixed(2);
                } else if (result.volume_cm3 > 150 && result.volume_cm3 <= 250) {
                    adjustedWeight = (weightDisplay * 0.58).toFixed(2);
                    adjustedVolume = (volumeDisplay * 0.58).toFixed(2);
                } else if (result.volume_cm3 > 250 && result.volume_cm3 <= 300) {
                    adjustedWeight = (weightDisplay * 0.55).toFixed(2);
                    adjustedVolume = (volumeDisplay * 0.55).toFixed(2);
                } else if (result.volume_cm3 > 300 && result.volume_cm3 <= 1000) {
                    adjustedWeight = (weightDisplay * 0.52).toFixed(2);
                    adjustedVolume = (volumeDisplay * 0.52).toFixed(2);
                } else if (result.volume_cm3 > 1000 && result.volume_cm3 <= 2000) {
                    adjustedWeight = (weightDisplay * 0.52).toFixed(2);
                    adjustedVolume = (volumeDisplay * 0.52).toFixed(2);
                } 


                // Definindo o preço com base no peso
                    let price;

                    // Verifica o valor do infill e calcula o preço com base no peso correto
                    if (infillValue === "30") {
                        price = (adjustedWeight * 0.70).toFixed(2);  // Preço para infill 30%
                    } else {
                        price = (weightDisplay * 0.70).toFixed(2);  // Preço para infill 100%
                    }
                
                // Converter dimensões para cm
                 let dimensionsInCm = convertToCm(result.dimensions);

                document.getElementById('results').innerHTML = `
                <div class="results" id="results">
                    <div class="model-properties">
                        <h2>Atributos da peça</h2>
                        <p><strong>Dimensões:</strong> ${dimensionsInCm.y} x ${dimensionsInCm.x} x ${dimensionsInCm.z} cm</p>
                        <p><strong>Volume:</strong> ${adjustedVolume} cm³</p>
                        <p><strong>Peso:</strong> ${adjustedWeight} g</p>
                    </div>

                    <div class="pricing-section">
                        <p><strong>Valor (aproximado): R$${price}</strong></p> <!-- Valor do orçamento -->
                        <button id="requestQuoteBtn">Solicitar orçamento</button>
                    </div>
                </div>
                `;
            } else {
                // Caso o infill seja 100%, exibe os valores normais
                    // Converter dimensões para cm
                let dimensionsInCm = convertToCm(result.dimensions);

                 // Verifica o valor do infill e calcula o preço com base no peso correto
                  if (infillValue === "30") {
                        price = (adjustedWeight * 0.70).toFixed(2);  // Preço para infill 30%
                    } else {
                        price = (weightDisplay * 0.70).toFixed(2);  // Preço para infill 100%
                    }
                
                document.getElementById('results').innerHTML = `
                <div class="results" id="results">
                    <div class="model-properties">
                        <h2>Atributos da peça</h2>
                        <p><strong>Dimensões:</strong> ${dimensionsInCm.y} x ${dimensionsInCm.x} x ${dimensionsInCm.z} cm</p>
                        <p><strong>Volume:</strong> ${volumeDisplay} cm³</p>    
                        <p><strong>Peso:</strong> ${weightDisplay} g</p>
                    </div>

                    <div class="pricing-section">
                        <p><strong>Valor (aproximado): R$${price}</strong></p> <!-- Valor do orçamento -->
                        <button id="requestQuoteBtn">Solicitar orçamento</button>
                    </div>
                </div>
                `;
            }


            // Ao clicar no botão de "Solicitar orçamento", redireciona para a página de orçamento com os dados
            document.getElementById('requestQuoteBtn').addEventListener('click', function() {
                const scaleValue = document.getElementById('scale').value;
                const infillValue = document.getElementById('infill').value;
                const materialValue = document.getElementById('material').value;

                // Criar a URL com os parâmetros para a página de solicitação de orçamento
                const url = `https://orcamentopresentes3d.netlify.app//index.html?scale=${scaleValue}&infill=${infillValue}&material=${materialValue}`;
                window.location.href = url;
            });





            // Exibir a observação após o upload bem-sucedido
            document.getElementById('observation').style.display = 'block'; 

            // Esconder o gif de carregamento imediatamente
            document.getElementById('loadingContainer').style.display = 'none';


        } else {
            throw new Error(result.error);
        }
    } catch (error) {

        // Esconder o gif de carregamento se der erro
        document.getElementById('loadingContainer').style.display = 'none';


        // Mensagem de erro
        document.getElementById('results').innerHTML = `
            <div class="error-message">
                <strong>Erro:</strong> ${error.message}
                <p>Se o problema persistir, <a href="https://wa.me/5511964031313" target="_blank" rel="noopener noreferrer">entre em contato conosco</a> para avaliarmos a viabilidade da impressão.</p>
            </div>
        `;
    }
});

function updateScaleValue() {
    const scaleSlider = document.getElementById('scale');
    const scaleNumber = document.getElementById('scaleNumber');

    // Atualiza o campo numérico com o valor da barra
    scaleNumber.value = scaleSlider.value;
}

function syncScaleWithNumber() {
    const scaleNumber = document.getElementById('scaleNumber');
    const scaleSlider = document.getElementById('scale');

    // Atualiza a barra deslizante com o valor do campo numérico
    scaleSlider.value = scaleNumber.value;
}




// Mostrar o modal de contato ao clicar no link
document.getElementById('contatoBtn').addEventListener('click', function() {
    document.getElementById('contatoModal').style.display = 'block';
});

// Fechar o modal ao clicar no "x"
document.getElementById('closeModal').addEventListener('click', function() {
    document.getElementById('contatoModal').style.display = 'none';
});

// Fechar o modal clicando fora da área do modal
window.addEventListener('click', function(event) {
    if (event.target == document.getElementById('contatoModal')) {
        document.getElementById('contatoModal').style.display = 'none';
    }
});






  // Função para carregar e exibir o modelo STL
  document.getElementById('stlFile').addEventListener('change', function (event) {
    const file = event.target.files[0];

    const reader = new FileReader();

    reader.onload = function (event) {
        const stlData = event.target.result;

        // Configuração básica da cena
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f0f0);

        const camera = new THREE.PerspectiveCamera(50, 500 / 300, 0.1, 1000);
        camera.position.set(0, 0, 130); // Ajuste da câmera

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(500, 300);
        document.getElementById('stlViewer').innerHTML = ''; // Limpa visualizações anteriores
        document.getElementById('stlViewer').appendChild(renderer.domElement);

        // Adicionar controles manuais
        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true; // Rotação suave
        controls.dampingFactor = 0.1;

        // Carregar o modelo STL
        const loader = new THREE.STLLoader();
        const geometry = loader.parse(stlData);

        const material = new THREE.MeshPhongMaterial({ color: 0x555555, specular: 0x111111, shininess: 200 });
        const mesh = new THREE.Mesh(geometry, material);




        // Centralizar o modelo e aplicar escala
        geometry.computeBoundingBox();
        const center = geometry.boundingBox.getCenter(new THREE.Vector3());
        mesh.geometry.translate(-center.x, -center.y, -center.z); // Centraliza o modelo
        mesh.scale.set(0.5, 0.5, 0.5); // Ajuste de escala

        // Ajustar rotação para visualização frontal
        mesh.rotation.x = -Math.PI / 2; // Rotaciona 90 graus no eixo X

        scene.add(mesh);

        // Luzes para melhorar o visual
        const ambientLight = new THREE.HemisphereLight(0xffffff, 0x888888, 1);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 10, 7.5);
        scene.add(directionalLight);

        // Animação: rotação automática do modelo
        function animate() {
            requestAnimationFrame(animate);
            controls.update(); // Atualiza os controles manuais
            renderer.render(scene, camera);
        }

        animate();
    };

    reader.readAsArrayBuffer(file); // Lê o arquivo STL

});
