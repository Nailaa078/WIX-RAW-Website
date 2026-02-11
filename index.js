const readbtn = document.getElementById("readBTN");
const backDrop = document.getElementById("backDrop");
const modal= document.getElementById("modal");
const close = document.getElementById("close");
 
function openModal(){
document.body.classList.add('open');
modal.setAttribute('aria-hidden', 'false');
close.focus();
}

function closeModal(){
    document.body.classList.remove('open');
    modal.setAttribute('aria-hidden' , 'true');
    readbtn.focus();
}
readbtn.addEventListener('click', openModal);
backDrop.addEventListener('click', closeModal);
// modal.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
  // sirf tab band ho jab bahar (overlay area) pe click pade
  if (e.target === modal) closeModal();
});
close.addEventListener('click', closeModal);

document.addEventListener('keydown', (e)=>{
    if(e.key==='Escape')
        closeModal();
});


                                          // for partition of pages

function showpage1() {
 document.getElementById("page1").style.display = "none" ;
 document.getElementById("page2").style.display = "block";
}