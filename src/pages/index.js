import Head from 'next/head';

export default function Home() {
  return (
    <>
     <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/1.9.2/tailwind.min.css"></link>
     
      <Head>
        <title>RadForms</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <div className="overflow-x-hidden antialiased">
        {/* Header */}
        <header className="relative z-50 w-full h-24">
          <div className="container flex items-center justify-center h-full max-w-6xl px-8 mx-auto sm:justify-between xl:px-0">
          <a href="#" class="relative flex items-center inline-block h-5 h-full font-black leading-none">
                <svg class="w-auto h-6 text-indigo-600 fill-current" viewBox="0 0 194 116"
                    xmlns="http://www.w3.org/2000/svg">
                </svg>
                <span class="ml-3 text-xl text-gray-800">RadForms<span class="text-pink-500">.</span></span>
            </a>
            <nav id="nav"
                class="absolute top-0 left-0 z-50 flex flex-col items-center justify-between hidden w-full h-64 pt-5 mt-24 text-sm text-gray-800 bg-white border-t border-gray-200 md:w-auto md:flex-row md:h-24 lg:text-base md:bg-transparent md:mt-0 md:border-none md:py-0 md:flex md:relative">
                <a href="#"
                    class="ml-0 mr-0 font-bold duration-100 md:ml-12 md:mr-3 lg:mr-8 transition-color hover:text-indigo-600">Home</a>
                <a href="#"
                    class="mr-0 font-bold duration-100 md:mr-3 lg:mr-8 transition-color hover:text-indigo-600">¿Qué es?</a>
                <a href="#"
                    class="mr-0 font-bold duration-100 md:mr-3 lg:mr-8 transition-color hover:text-indigo-600">Funciones</a>
                <div class="flex flex-col block w-full font-medium border-t border-gray-200 md:hidden">                 
                </div>
            </nav>
            <div
                class="absolute left-0 flex-col items-center justify-center hidden w-full pb-8 mt-48 border-b border-gray-200 md:relative md:w-auto md:bg-transparent md:border-none md:mt-0 md:flex-row md:p-0 md:items-end md:flex md:justify-between">
                <a href="auth/login"
                    class="relative z-40 inline-block w-auto h-fullpx-3 py-2 mr-0 text-sm font-bold text-pink-500 md:px-5 lg:text-pink sm:mr-3 md:mt-0 rounded shadow-md fold-bold lg:bg-white lg:text-white-700 sm:w-full lg:shadow-none hover:shadow-xl">Login</a>
                <a href="auth/register"
                    class="relative z-40 inline-block w-auto h-full px-5 py-3 text-sm font-bold leading-none text-white transition-all transition duration-100 duration-300 bg-indigo-700 rounded shadow-md fold-bold lg:bg-white lg:text-indigo-700 sm:w-full lg:shadow-none hover:shadow-xl">Registrarse
                    </a>                                  
            </div>
            <div id="nav-mobile-btn"
                class="absolute top-0 right-0 z-50 block w-6 mt-8 mr-10 cursor-pointer select-none md:hidden sm:mt-10">
                <span class="block w-full h-1 mt-2 duration-200 transform bg-gray-800 rounded-full sm:mt-1"></span>
                <span class="block w-full h-1 mt-1 duration-200 transform bg-gray-800 rounded-full"></span>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <div class="relative items-center justify-center w-full overflow-x-hidden lg:pt-40 lg:pb-40 xl:pt-40 xl:pb-64">
        <div
            class="container flex flex-col items-center justify-between h-full max-w-6xl px-8 mx-auto -mt-32 lg:flex-row xl:px-0">
            <div
                class="z-30 flex flex-col items-center w-full max-w-xl pt-48 text-center lg:items-start lg:w-1/2 lg:pt-20 xl:pt-40 lg:text-left">
                <h1 class="relative mb-4 text-3xl font-black leading-tight text-gray-900 sm:text-6xl xl:mb-8">
                    Formulario Rapidos
                    </h1>
                <p class="pr-0 mb-8 text-base text-gray-600 sm:text-lg xl:text-xl lg:pr-20">Cansado de pensar en que
                    debe llevar un formulario? Hazlo con Ayuda del asistete Rad!
                </p>
                <a href="auth/register"
                    class="relative self-start inline-block w-auto px-8 py-4 mx-auto mt-0 text-base font-bold text-white bg-green-600 hover:bg-green-700 border-t border-gray-200 rounded-md shadow-xl sm:mt-1 fold-bold lg:mx-0">Registrate
                    Ahora!</a>
                
                <div class="flex-col hidden mt-12 sm:flex lg:mt-24">
                    <p class="mb-4 text-sm font-medium tracking-widest text-gray-500 uppercase">Integrado Con</p>
                    <div class="flex">
                        <p class="mb-4 text-sm font-medium tracking-widest text-gray-500 uppercase">Gemini AI</p>
                        <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M16 8.016A8.522 8.522 0 008.016 16h-.032A8.521 8.521 0 000 8.016v-.032A8.521 8.521 0 007.984 0h.032A8.522 8.522 0 0016 7.984v.032z" fill="url(#prefix__paint0_radial_980_20147)"/>
                            <defs>
                                <radialGradient id="prefix__paint0_radial_980_20147" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="matrix(16.1326 5.4553 -43.70045 129.2322 1.588 6.503)">
                                    <stop offset=".067" stop-color="#9168C0"/>
                                    <stop offset=".343" stop-color="#5684D1"/>
                                    <stop offset=".672" stop-color="#1BA1E3"/>
                                </radialGradient>
                            </defs>
                        </svg>                                                               
                    </div>
                </div>
                
            </div>
            <div class="relative z-50 flex flex-col items-end justify-center w-full h-full lg:w-1/2 ms:pl-10">
                <div class="container relative left-0 w-full max-w-4xl lg:absolute xl:max-w-6xl lg:w-screen">
                    <image src="https://cdn.devdojo.com/images/september2020/macbook-mockup.png"  alt="" aria-hidden="true"
                        class="w-full h-auto mt-20 mb-20 ml-0 lg:mt-24 xl:mt-40 lg:mb-0 lg:h-full lg:-ml-12"></image>
                </div>
            </div>
        </div>
    </div>

    <div id="features" class="relative w-full px-8 py-10 border-t border-gray-200 md:py-16 lg:py-24 xl:py-40 xl:px-0">
        <div class="container flex flex-col items-center justify-between h-full max-w-6xl mx-auto">
            <h2 class="my-5 text-base font-medium tracking-tight text-indigo-700 uppercase">Sobre Radforms</h2>
            <h3
                class="max-w-2xl px-5 mt-2 text-3xl font-black leading-tight text-center text-gray-900 sm:mt-0 sm:px-0 sm:text-6xl">
                Crea formularios con la ayuda de Rad</h3>
            <div class="flex flex-col w-full mt-0 lg:flex-row sm:mt-10 lg:mt-20">

                <div class="w-full max-w-md p-4 mx-auto mb-0 sm:mb-16 lg:mb-0 lg:w-1/3">
                    <div class="relative flex flex-col items-center justify-center w-full h-full p-20 mr-5 rounded-lg">
                        <svg class="absolute w-full h-full text-gray-100 fill-current" viewBox="0 0 377 340"
                            xmlns="http://www.w3.org/2000/svg">
                            <g>
                                <g>
                                    <path
                                        d="M342.8 3.7c24.7 14 18.1 75 22.1 124s18.6 85.8 8.7 114.2c-9.9 28.4-44.4 48.3-76.4 62.4-32 14.1-61.6 22.4-95.9 28.9-34.3 6.5-73.3 11.1-95.5-6.2-22.2-17.2-27.6-56.5-47.2-96C38.9 191.4 5 151.5.9 108.2-3.1 64.8 22.7 18 61.8 8.7c39.2-9.2 91.7 19 146 16.6 54.2-2.4 110.3-35.6 135-21.6z" />
                                </g>
                            </g>
                        </svg>            
                        <h4 class="relative mt-6 text-lg text-center font-bold">
                            Herramienta Automatica
                        </h4>
                        <p class="relative mt-2 text-base text-center text-gray-600">
                            Crea un formulario automaticamente apartir de cualquier tema
                        </p>
                        
                    </div>
                </div>

                <div class="w-full max-w-md p-4 mx-auto mb-0 sm:mb-16 lg:mb-0 lg:w-1/3">
                    <div class="relative flex flex-col items-center justify-center w-full h-full p-20 mr-5 rounded-lg">
                        <svg class="absolute w-full h-full text-gray-100 fill-current" viewBox="0 0 358 372"
                            xmlns="http://www.w3.org/2000/svg">
                            <g>
                                <g>
                                    <path
                                        d="M315.7 6.5c30.2 15.1 42.6 61.8 41.5 102.5-1.1 40.6-15.7 75.2-24.3 114.8-8.7 39.7-11.3 84.3-34.3 107.2-23 22.9-66.3 23.9-114.5 30.7-48.2 6.7-101.3 19.1-123.2-4.1-21.8-23.2-12.5-82.1-21.6-130.2C30.2 179.3 2.6 141.9.7 102c-2-39.9 21.7-82.2 57.4-95.6 35.7-13.5 83.3 2.1 131.2 1.7 47.9-.4 96.1-16.8 126.4-1.6z" />
                                </g>
                            </g>
                        </svg>                     
                        <h4 class="relative mt-6 text-lg font-bold">
                          Decide
                        </h4>
                        <p class="relative mt-2 text-base text-center text-gray-600">
                          Puedes apoyarte de las sugerencias de Rad o crearlo tu mismo
                        </p>
                        
                    </div>
                </div>
                <div class="w-full max-w-md p-4 mx-auto mb-16 lg:mb-0 lg:w-1/3">
                    <div class="relative flex flex-col items-center justify-center w-full h-full p-20 mr-5 rounded-lg"> 
                    <svg class="absolute w-full h-full text-gray-100 fill-current" viewBox="0 0 378 410"
                            xmlns="http://www.w3.org/2000/svg">
                            <g>
                                <g>
                                    <path
                                        d="M305.9 14.4c23.8 24.6 16.3 84.9 26.6 135.1 10.4 50.2 38.6 90.3 43.7 137.8 5.1 47.5-12.8 102.4-50.7 117.4-37.9 15.1-95.7-9.8-151.7-12.2-56.1-2.5-110.3 17.6-130-3.4-19.7-20.9-4.7-82.9-11.5-131.2C25.5 209.5-3 174.7 1.2 147c4.2-27.7 41-48.3 75-69.6C110.1 56.1 141 34.1 184 17.5c43.1-16.6 98.1-27.7 121.9-3.1z" />
                                </g>
                            </g>
                        </svg>                                       
                        <h4 class="relative mt-6 text-lg font-bold">
                            No hay limites
                        </h4>
                        <p class="relative mt-2 text-base text-center text-gray-600">
                          Usa la funcion de crear formularios automaticamente sin ninguna restriccion
                        </p>
                                                 
                    </div>
                </div>

            </div>
        </div>
    </div>

        {/* Footer */}
        <footer className="px-4 py-8 bg-white border-t border-gray-200 text-center text-gray-600">
          © 2025 RadForms. Todos los derechos reservados.
        </footer>
      </div>
    </>
  );
}
