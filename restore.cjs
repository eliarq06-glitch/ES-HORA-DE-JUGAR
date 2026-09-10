const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://bwraakmvdongavgsswhb.supabase.co', 'sb_publishable_eUXUnci_LbEUbJrvERWu1g_r7yNiWtt');
const players = [
  { id: 1788311427564, first_name: 'VICTOR', last_name: 'ELIZONDO', email: 'eli.arq.06@gmail.com' },
  { id: 1788903498069, first_name: 'JORGE', last_name: 'LOPEZ', email: 'ueeem.lopezjorge@gmail.com' },
  { id: 1788898969421, first_name: 'LUIS ', last_name: 'PULLEY', email: 'luchops77@gmail.com' },
  { id: 1788903510466, first_name: 'NYCK', last_name: 'VILLACIS', email: 'nyckvr10@gmail.com' },
  { id: 1788903534905, first_name: 'JOSE', last_name: 'ICAZA', email: 'jose.icaza97@gmail.com' },
  { id: 1788903474096, first_name: 'ARMANDO', last_name: 'ARREGUI', email: 'armandoarreguidiaz@gmail.com' },
  { id: 1788903500956, first_name: 'LUIS', last_name: 'MARIN', email: 'luis_marin_23@hotmail.com' },
  { id: 1789070657933, first_name: 'ROGERS ', last_name: 'ARROYO ', email: 'isaacarroyovalverde@gmail.com' },
  { id: 1788903607434, first_name: 'FABRICIO', last_name: 'SANCHEZ', email: 'raulfabriciosanchezsantacruz@gmail.com' },
  { id: 1788903596953, first_name: 'SANTIAGO', last_name: 'ICAZA', email: 'icazasanti@gmail.com' },
  { id: 1788903626247, first_name: 'JALMAR', last_name: 'CALVACHE', email: 'jomcalpe@hotmail.com' },
  { id: 1788903646304, first_name: 'OMAR', last_name: 'PALMA', email: 'omarpalmaing@yahoo.es' },
  { id: 1788903540543, first_name: 'PATRICIO', last_name: 'SORIANO', email: 'patosoriano23@gmail.com' },
  { id: 1788903683988, first_name: 'ALEX', last_name: 'GARCIA', email: 'alex_garcia_ortiz@hotmail.com' },
  { id: 1788903500751, first_name: 'ALEXANDER', last_name: 'MANZANO', email: 'alexandermanzano971@gmail.com' },
  { id: 1788903498038, first_name: 'ANGEL', last_name: 'MOSQUERA', email: 'angelmosquera201988@gmail.com' },
  { id: 1788903525015, first_name: 'LUIS ', last_name: 'MARMOLEJO', email: 'luismarmolejo07@gmail.com' },
  { id: 1788903534638, first_name: 'LUIS', last_name: 'ALCIVAR', email: 'luisalcivarcadena@gmail.com' },
  { id: 1788903688713, first_name: 'OSCAR', last_name: 'SANCHEZ', email: 'osc15454@gmail.com' },
  { id: 1788903603776, first_name: 'GUILLERMO', last_name: 'LEON', email: 'gleontumbaco@gmail.com' },
  { id: 1789060495938, first_name: 'DANNY', last_name: 'MARMOLEJO', email: 'danicitomarmolejo2190@gmail.com' },
  { id: 1788904629688, first_name: 'SERGIO', last_name: 'SUAREZ', email: 'sergiosuarezu@gmail.com' },
  { id: 1788903670576, first_name: 'JOSE', last_name: 'MORA', email: 'joserobertomorac@gmail.com' },
  { id: 1788904146961, first_name: 'CRISTHIAN', last_name: 'LAMAN', email: 'cristhianlaman@gmail.con' },
  { id: 1789066976554, first_name: 'LUIS', last_name: 'PINCAY', email: 'lcr7_@hotmail.com' },
  { id: 1788904031674, first_name: 'ANDRES', last_name: 'PAZMIÑO', email: 'andrespazmino939@gmail.com' },
  { id: 1788904635087, first_name: 'CARLOSRAUL', last_name: 'ALVARADO', email: 'carlos_sal_ito@outlook.com' },
  { id: 1788909520853, first_name: 'ISRAEL ', last_name: 'ARAGUNDI', email: 'iaragundi433@fafi.utb.edu.ec' },
  { id: 1788903708773, first_name: 'FRANK', last_name: 'VARGAS', email: 'frankvargas1990@gmail.com' },
  { id: 1788903619165, first_name: 'RAUL', last_name: 'ICAZA', email: 'raulicaza72@hotmail.com' },
  { id: 1788903571887, first_name: 'DANNY', last_name: 'PEREZ', email: 'dannyperezq8@gmail.com' },
  { id: 1789060454940, first_name: 'JOHNNY', last_name: 'MORAN', email: 'johnnyamn57@gmail.com' },
  { id: 1788905309715, first_name: 'FERNANDO', last_name: 'CASTRO', email: 'f.erchocastrooo23@gmail.com' },
  { id: 1788909510856, first_name: 'ANGEL', last_name: 'VALAREZO', email: 'valarezocardenas89@gmail.com' },
  { id: 1788904103168, first_name: 'BORIS', last_name: 'TARIRA', email: 'btarirav@fafi.utb.edu.ec' },
  { id: 1788906692785, first_name: 'FLAVIO', last_name: 'CHANG', email: 'flavio9709@gmail.com' },
  { id: 1788905435212, first_name: 'DARIO', last_name: 'RUIZ', email: 'ruizd5081@gamail.com' },
  { id: 1788903736894, first_name: 'KEVIN', last_name: 'GOYES', email: 'kggu94@gmail.com' },
  { id: 1789068974100, first_name: 'ANDRES', last_name: 'OLVERA', email: 'andresmia2992@gmail.com' },
  { id: 1788908646580, first_name: 'JOSE', last_name: 'MORAN', email: 'josemorannarvaez@gmail.com' },
  { id: 1788904106184, first_name: 'GREGORIO', last_name: 'CONTRERAS', email: 'gregorio.contreras1727@gmail.com' },
  { id: 1788903825424, first_name: 'JONATHAN', last_name: 'CASTRO', email: 'jonathanfer710@gmail.com' },
  { id: 1788904521277, first_name: 'EULISES', last_name: 'JUNCO', email: 'juncoeulises6@gmail.com' },
  { id: 1789070406653, first_name: 'MARCOS', last_name: 'MENDOZA', email: 'agromen1302@gmail.com' }
];

async function restore() {
  console.log('Restoring ' + players.length + ' players...');
  for (let p of players) {
    const { error } = await supabase.from('players').upsert({
      id: p.id,
      first_name: p.first_name,
      last_name: p.last_name,
      nickname: '',
      email: p.email,
      position: 'MCO',
      status: 'active',
      stars: 3,
      card_type: 'base'
    });
    if (error) {
      console.error('Error on', p.first_name, error);
    } else {
      console.log('Restored', p.first_name);
    }
  }
  console.log('Done restoring players!');
}
restore();
