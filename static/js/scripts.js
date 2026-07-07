
const content_dir = 'contents/'
const config_file = 'config.yml'
const section_names = ['home', 'publications', 'awards']

function getFallbackId(filename) {
    if (filename === config_file) return 'fallback-config'
    const name = filename.replace('.md', '')
    return 'fallback-' + name
}

async function loadText(filename) {
    try {
        const response = await fetch(content_dir + filename)
        if (response.ok) return await response.text()
    } catch (error) {
        console.log('Fetch failed for ' + filename + ', using embedded fallback.')
    }

    const fallback = document.getElementById(getFallbackId(filename))
    if (fallback) return fallback.textContent
    return null
}

function applyConfig(text) {
    if (!text || typeof jsyaml === 'undefined') return
    const yml = jsyaml.load(text)
    Object.keys(yml).forEach(key => {
        const el = document.getElementById(key)
        if (el) el.innerHTML = yml[key]
    })
}

function renderMarkdown(name, markdown) {
    if (!markdown) return
    const container = document.getElementById(name + '-md')
    if (!container || typeof marked === 'undefined') return
    container.innerHTML = marked.parse(markdown)
    if (typeof MathJax !== 'undefined' && MathJax.typeset) {
        MathJax.typeset()
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const mainNav = document.body.querySelector('#mainNav')
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            offset: 74,
        })
    }

    const navbarToggler = document.body.querySelector('.navbar-toggler')
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    )
    responsiveNavItems.forEach(responsiveNavItem => {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click()
            }
        })
    })

    loadText(config_file)
        .then(applyConfig)
        .catch(error => console.log(error))

    if (typeof marked !== 'undefined') {
        marked.use({ mangle: false, headerIds: false })
    }

    section_names.forEach(name => {
        loadText(name + '.md')
            .then(markdown => renderMarkdown(name, markdown))
            .catch(error => console.log(error))
    })
})
