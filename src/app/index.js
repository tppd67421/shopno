import Msg from 'msg-modal'
import '@/assets/styles/main.scss'

const msg = Msg.factory()
window.msg = msg

console.log(msg)

const getFullImagePath = (number) => `featured/work-${number}-full.jpg`

document.querySelectorAll('.works__item').forEach((item, counter) => {
    item.addEventListener('click', () => {
        msg.show(
            `<img
                class='works__item_full-size'
                src=${getFullImagePath(counter + 1)}
                alt='Work ${counter + 1}. Full preview'
            >`
        )
    })
})
