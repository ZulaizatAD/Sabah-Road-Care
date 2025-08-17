import react from 'react'
import AvatarCopilot from '../../../assets/Avatar_FunFacts/Avatar_Copilot_001.webm';


const AvatarMain = () => {
  return (
    
      <div className='AvatarMain'>
       <video src={AvatarCopilot} autoPlay loop muted/>
      </div>
  )
}

export default AvatarMain;