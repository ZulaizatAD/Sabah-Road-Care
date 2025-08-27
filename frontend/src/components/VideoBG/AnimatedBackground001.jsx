import react from 'react'
// import AnimatedBG_Gradient from '../../../public/assets/VideoFiles/GreyBackgroundAE_Loop_002.webm';


const AnimatedBG = () => {
  return (
    
      <div className='AnimatedBG'>
       <video src= '/assets/VideoFiles/MainPageBG001.webm' autoPlay loop muted playsInline/>
      </div>
  )
}

export default AnimatedBG;