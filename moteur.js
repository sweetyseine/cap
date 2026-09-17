/* Moteur commun des séances numériques — Sylvaine Talbaut
   Lecture audio, dictée vocale, sommaire, pagination, impression.
   Partagé par toutes les séances : une correction ici les corrige toutes.
   Doit rester dans le même dossier que les fichiers de séance. */

/* ---- sommaire : une page par section ---- */
(function(){
  /* à l'ouverture : première page, et tout en haut */
  try{ if('scrollRestoration' in history) history.scrollRestoration = 'manual'; }catch(e){}
  window.addEventListener('load', function(){
    window.scrollTo(0, 0);
    setTimeout(function(){ window.scrollTo(0, 0); }, 60);
  });

  var secs = [].slice.call(document.querySelectorAll('.sec'));
  var nav = document.getElementById('nav-sec');
  var courant = 0;
  function montrer(i){
    secs.forEach(function(s, k){ s.classList.toggle('visible', k === i); });
    [].forEach.call(nav.querySelectorAll('.som-lien'), function(b, k){ b.classList.toggle('actif', k === i); });
    [].forEach.call(nav.querySelectorAll('.sous-liens'), function(g){
      g.style.display = (+g.dataset.pour === i) ? '' : 'none'; });
    var prec = document.getElementById('prec'), suiv = document.getElementById('suiv');
    prec.disabled = (i === 0); suiv.disabled = (i === secs.length - 1);
    prec.style.display = (i === 0) ? 'none' : '';
    suiv.style.display = (i === secs.length - 1) ? 'none' : '';
    prec.innerHTML = '&#8249; Page précédente';
    suiv.innerHTML = 'Page suivante &#8250;';
    document.getElementById('pager-pos').textContent = 'Page ' + (i+1) + ' sur ' + secs.length;
    courant = i;
    window.scrollTo(0, 0);
  }
  secs.forEach(function(s, i){
    var b = document.createElement('div');
    b.className = 'som-lien'; b.textContent = s.dataset.titre;
    b.tabIndex = 0; b.setAttribute('role', 'button');
    b.addEventListener('click', function(){ montrer(i); });
    b.addEventListener('keydown', function(e){ if(e.key === 'Enter' || e.key === ' ') montrer(i); });
    nav.appendChild(b);

    /* sous-parties de la section */
    var titres = s.querySelectorAll('h2.sect, .panneau > h2, .activite > h3');
    if(!titres.length) return;
    var sous = document.createElement('div');
    sous.className = 'sous-liens'; sous.dataset.pour = i;
    [].forEach.call(titres, function(t, k){
      if(!t.id) t.id = 'p' + i + '-' + k;
      var l = document.createElement('div');
      l.className = 'sous-lien'; l.tabIndex = 0; l.setAttribute('role', 'button');
      l.textContent = t.textContent.replace(/\s+/g, ' ').replace(/^[▶\s]+/, '').trim();
      l.addEventListener('click', function(){
        montrer(i);
        setTimeout(function(){ t.scrollIntoView({block:'start', behavior:'smooth'}); }, 30);
      });
      sous.appendChild(l);
    });
    nav.appendChild(sous);
  });
  document.getElementById('prec').addEventListener('click', function(){ if(courant > 0) montrer(courant - 1); });
  document.getElementById('suiv').addEventListener('click', function(){ if(courant < secs.length - 1) montrer(courant + 1); });
  montrer(0);   /* à l'ouverture, toujours la première page */

  /* deux onglets dans le volet : Sommaire / Outils */
  var onglets = [].slice.call(document.querySelectorAll('.onglet'));
  onglets.forEach(function(o){
    o.addEventListener('click', function(){
      onglets.forEach(function(x){
        x.classList.toggle('actif', x === o);
        document.getElementById(x.dataset.vol).hidden = (x !== o);
      });
    });
  });

  var cadre = document.getElementById('cadre');
  var boutonsVolet = [].slice.call(document.querySelectorAll('.replier'));

  function ouvrirVolet(vol){
    var dejaOuvert = !cadre.classList.contains('replie');
    var actif = document.querySelector('.onglet.actif');
    if(dejaOuvert && actif && actif.dataset.vol === vol){
      cadre.classList.add('replie');           /* même onglet : on referme */
    } else {
      cadre.classList.remove('replie');
      onglets.forEach(function(x){
        x.classList.toggle('actif', x.dataset.vol === vol);
        document.getElementById(x.dataset.vol).hidden = (x.dataset.vol !== vol);
      });
    }
    majBoutonsVolet();
  }
  function majBoutonsVolet(){
    var ouvert = !cadre.classList.contains('replie');
    var actif = document.querySelector('.onglet.actif');
    boutonsVolet.forEach(function(b){
      b.classList.toggle('ouvert', ouvert && actif && actif.dataset.vol === b.dataset.vol);
    });
  }
  boutonsVolet.forEach(function(b){
    b.addEventListener('click', function(){ ouvrirVolet(b.dataset.vol); });
  });
  onglets.forEach(function(o){ o.addEventListener('click', majBoutonsVolet); });
  document.addEventListener('keydown', function(e){
    if((e.key === 's' || e.key === 'S') && !/input|textarea|select/i.test((e.target.tagName||'')))
      ouvrirVolet('nav-sec');
  });
  majBoutonsVolet();

  /* les commandes descendent dans le volet, plus rien n'est fixé en bas */
  window.addEventListener('load', function(){
    var outils = document.getElementById('outils');
    var audio = document.querySelector('.barre-audio');
    if(audio){
      outils.appendChild(audio);
      /* les deux boutons de vitesse reçoivent leur légende */
      [['vMoins', 'parle moins vite'], ['vPlus', 'parle plus vite']].forEach(function(p){
        var b = document.getElementById(p[0]); if(!b) return;
        var col = document.createElement('div'); col.className = 'col-vitesse';
        b.parentNode.insertBefore(col, b); col.appendChild(b);
        var l = document.createElement('span'); l.className = 'legende'; l.textContent = p[1];
        col.appendChild(l);
        document.getElementById('vitesse-flottante').appendChild(col);
      });
      var zone = document.getElementById('vitesse-flottante');
      var pc = document.getElementById('aVitesse');
      if(pc){ pc.classList.add('pourcent'); zone.insertBefore(pc, zone.children[1] || null); }
      var lecture = document.getElementById('boite-lecture');
      ['aPlay','aPause','aStop'].forEach(function(id){
        var e = document.getElementById(id); if(e) lecture.appendChild(e); });
      var reglages = document.getElementById('boite-reglages');
      ['aRepeter','aMoins','aPlus'].forEach(function(id){
        var e = document.getElementById(id); if(e) reglages.appendChild(e); });
      var et = document.getElementById('aEtat');
      if(et) document.getElementById('etat-lecture').appendChild(et);
      var bm = document.getElementById('boite-micro');
      var m = document.getElementById('micro'); if(m) bm.appendChild(m);
      var aide = document.querySelector('.rappel-dictee');
      var acc = document.getElementById('aide-voix');
      if(aide && acc){ acc.appendChild(aide); }
      audio.remove();
    }
    document.getElementById('outils').hidden = false;
    outils.appendChild(document.getElementById('barre-outils'));
  });
})();

/* ---- champs de saisie : hauteur automatique et sauvegarde sur le poste ---- */
(function(){
  var cle = 'seance-' + document.title;
  var memoire = {};
  try{ memoire = JSON.parse(localStorage.getItem(cle) || '{}'); }catch(e){}
  function ranger(){ try{ localStorage.setItem(cle, JSON.stringify(memoire)); }catch(e){} }
  function ajuster(t){
    t.style.height = 'auto';
    var mini = (parseInt(t.getAttribute('rows'), 10) || 2) * 30;   /* la case garde sa hauteur prévue */
    t.style.height = Math.max(t.scrollHeight + 4, mini) + 'px';
  }
  document.querySelectorAll('input.champ-date').forEach(function(t, i){
    var id = t.dataset.id || ('d'+i); t.dataset.id = id;
    if(memoire[id]) t.value = memoire[id];
    t.addEventListener('input', function(){ memoire[id]=t.value; ranger(); });
  });
  document.querySelectorAll('textarea.rep-saisie').forEach(function(t, i){
    var id = t.dataset.id || ('c'+i); t.dataset.id = id;
    if(memoire[id]){ t.value = memoire[id]; }
    ajuster(t);
    t.addEventListener('input', function(){ memoire[id]=t.value; ranger(); ajuster(t); });
  });
  /* ---- étiquettes à placer (un ou plusieurs jeux par page) ---- */
  document.querySelectorAll('.jeu').forEach(function(jeu){
    var prise = null;
    var reserve = jeu.querySelector('.reserve');
    if(!reserve) return;
    var places = [].slice.call(jeu.querySelectorAll('.place'));

    function texteEtiquette(e){
      var c = e.cloneNode(true);
      [].slice.call(c.querySelectorAll('button')).forEach(function(b){ b.remove(); });
      return c.textContent.trim();
    }
    function poser(td, texte){
      td.innerHTML = '<span class="dedans">' + texte + '</span>';
      td.classList.remove('vide');
      memoire['place-' + td.dataset.id] = texte; ranger();
    }
    function montrer(t){
      [].slice.call(reserve.children).forEach(function(e){
        if(texteEtiquette(e) === t) e.style.display = '';
      });
    }
    function rendre(td){
      var t = td.textContent.trim();
      if(!t) return;
      td.innerHTML = ''; td.classList.add('vide');
      delete memoire['place-' + td.dataset.id]; ranger();
      montrer(t);
    }
    function brancher(e){
      e.addEventListener('click', function(ev){
        if(ev.target.closest && ev.target.closest('.ecoute')) return;
        if(prise === e){ e.classList.remove('prise'); prise = null; }
        else {
          if(prise) prise.classList.remove('prise');
          prise = e; e.classList.add('prise');
        }
        places.forEach(function(td){ td.classList.toggle('cible', !!prise); });
      });
    }
    [].slice.call(reserve.querySelectorAll('.etiq-mob')).forEach(brancher);

    places.forEach(function(td){
      td.addEventListener('click', function(){
        if(prise){
          if(!td.classList.contains('vide')) rendre(td);
          poser(td, texteEtiquette(prise));
          prise.style.display = 'none'; prise.classList.remove('prise'); prise = null;
          places.forEach(function(c){ c.classList.remove('cible'); });
        } else if(!td.classList.contains('vide')){
          rendre(td);
        }
      });
      var t = memoire['place-' + td.dataset.id];
      if(!t) return;
      td.innerHTML = '<span class="dedans">' + t + '</span>'; td.classList.remove('vide');
      [].slice.call(reserve.children).forEach(function(e){
        if(texteEtiquette(e) === t) e.style.display = 'none';
      });
    });
  });

  document.querySelectorAll('select.choix-liste').forEach(function(sel, i){
    var id = sel.dataset.id || ('s'+i); sel.dataset.id = id;
    if(memoire[id]) sel.value = memoire[id];
    sel.addEventListener('change', function(){
      if(sel.value) memoire[id] = sel.value; else delete memoire[id];
      ranger();
    });
  });
  document.querySelectorAll('.page input[type=checkbox], .page input[type=radio]').forEach(function(c, i){
    var id = c.dataset.id || ('k'+i); c.dataset.id = id;
    if(memoire[id]) c.checked = true;
    c.addEventListener('change', function(){
      if(c.type === 'radio'){
        [].forEach.call(document.getElementsByName(c.name), function(r){ delete memoire[r.dataset.id]; });
      }
      if(c.checked) memoire[id] = 1; else delete memoire[id];
      ranger();
    });
  });
  /* ---- dictée : un bouton dans la page, pas de raccourci clavier ---- */
  var champCourant = null, reco = null, enMarche = false, recuQuelqueChose = false;
  var ecrit = false;   /* le micro reste ouvert ; ce drapeau dit si la voix écrit */
  var enAttente = '';  /* mots entendus mais pas encore confirmés par Chrome */
  var socle = '', champSocle = null;   /* texte déjà acquis dans la case en cours */
  var actif = false;   /* la reconnaissance tourne-t-elle vraiment ? */
  /* Sur un site (https), couper le micro ne coûte rien : l'autorisation est retenue.
     Depuis un fichier du disque, Chrome la redemande à chaque fois : on garde alors
     le micro ouvert et on JETTE tout ce qui a été dit pendant la pause. */
  var surSite = (location.protocol === 'https:' || location.protocol === 'http:');
  var vus = 0;         /* nombre de phrases déjà livrées par Chrome */
  var barriere = 0;    /* tout ce qui est en dessous ne s'écrit jamais */
  var btn = document.getElementById('micro'), info = document.getElementById('info-micro');

  document.querySelectorAll('textarea.rep-saisie, input.champ-date').forEach(function(ch){
    ch.addEventListener('focus', function(){
      if(champCourant !== ch) barriere = vus;   /* la phrase en cours ne suit pas dans la nouvelle case */
      champCourant = ch; champSocle = ch; socle = ch.value; enAttente = '';
      majAttente(); suivreCase(); });
    ch.addEventListener('blur', function(){
      setTimeout(function(){
        if(document.activeElement !== btn && document.activeElement === document.body){
          champCourant = null;      /* plus de case choisie : la voix n'écrit nulle part */
          majAttente(); suivreCase(); }
      }, 0);
    });
  });

  /* ---- une gomme sur chaque case de réponse ---- */
  document.querySelectorAll('textarea.rep-saisie').forEach(function(t){
    var env = document.createElement('div'); env.className = 'enveloppe-rep';
    t.parentNode.insertBefore(env, t); env.appendChild(t);
    var g = document.createElement('button');
    g.className = 'gomme'; g.type = 'button'; g.tabIndex = -1;
    g.title = 'Effacer cette réponse'; g.innerHTML = '&times;';
    g.addEventListener('click', function(){
      t.value = ''; t.dispatchEvent(new Event('input')); t.focus();
    });
    env.appendChild(g);
  });

  function dire(t){ if(info) info.textContent = t; }

  function coller(avant, ajout){
    avant = avant || '';
    if(!ajout) return avant;
    return avant + ((avant && !/\s$/.test(avant)) ? ' ' : '') + ajout;
  }
  function poser(texte){
    if(!champCourant) return;
    champCourant.value = texte;
    champCourant.dispatchEvent(new Event('input'));
  }
  function ecrire(t){
    if(!champCourant) return;
    t = String(t).replace(/^\s+/, '');
    if(!t) return;
    if(champSocle !== champCourant){ champSocle = champCourant; socle = champCourant.value; }
    socle = coller(socle, t);
    poser(socle);
  }

  function arreterDictee(){
    /* les derniers mots entendus, que Chrome n'a pas encore confirmés, sont écrits */
    if(ecrit && champCourant){ socle = champCourant.value; champSocle = champCourant; }
    enAttente = '';
    ecrit = false;                 /* mise en veille : plus rien ne s'écrit */
    barriere = vus;                /* ce qui a été dit jusqu'ici ne reviendra pas */
    if(surSite && reco && enMarche){   /* page servie par un site : micro vraiment coupé */
      enMarche = false;                /* (pour que onend ne le relance pas) */
      try{ reco.abort(); }catch(e){}
    }
    var bandeau = document.getElementById('etat-micro');
    if(bandeau){ bandeau.classList.remove('on'); bandeau.classList.remove('attente');
                 if(enMarche){ bandeau.classList.add('veille');
                               bandeau.innerHTML = '<span class="rond"></span>En pause'; }
                 else bandeau.classList.remove('veille'); }
    var cons = document.getElementById('console-dictee');
    if(cons){ cons.classList.remove('on'); cons.classList.remove('attente'); }
    if(btn){ btn.classList.remove('ecoute-en-cours');
             btn.innerHTML = '<span class="rond"></span><span class="lab">Parler</span>'; }
  }

  /* coupure réelle du micro : uniquement en cas de refus ou d'erreur */
  function couperDictee(){
    arreterDictee();
    enMarche = false;
    if(reco){ try{ reco.stop(); }catch(e){} }
  }

  function demarrerDictee(){
    var Reco = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!Reco){ dire("Ce navigateur ne sait pas écrire sous la dictée. Ouvre la page avec Chrome ou Edge."); return; }
    recuQuelqueChose = false;
    /* un seul objet de reconnaissance pour toute la page :
       le micro n'est autorisé qu'une fois, pas à chaque clic sur Parler */
    if(reco && enMarche){        /* le micro n'a jamais été coupé : reprise immédiate */
      if(!actif){ try{ reco.start(); }catch(e){} }   /* Chrome l'avait arrêté : on relance */
      marcheVisible();
      return;
    }
    if(reco){
      enMarche = true;
      try{ reco.start(); }
      catch(e){ if(!/already started/i.test(e && e.message || '')){
                  enMarche = false; dire("La dictée n'a pas pu démarrer."); return; } }
      marcheVisible();
      return;
    }
    reco = new Reco();
    reco.lang = 'fr-FR'; reco.continuous = true; reco.interimResults = true;
    reco.onresult = function(e){
      vus = e.results.length;
      if(!ecrit){ barriere = vus; return; }    /* en pause : rien ne s'écrit, et ce qui
                                                  vient d'être dit est mis de côté */
      var t = '', provisoire = '';
      var depart = Math.max(e.resultIndex, barriere);
      for(var i = depart; i < e.results.length; i++){
        if(e.results[i].isFinal) t += e.results[i][0].transcript;
        else provisoire += e.results[i][0].transcript;
      }
      var vu = document.getElementById('console-entendu');
      if(vu && (t || provisoire)){ vu.textContent = '« ' + (t || provisoire).trim() + ' »'; }
      if(!champCourant){                       /* aucune case choisie : rien ne s'écrit */
        dire("Clique dans une case de réponse : le texte s'y écrira aussitôt.");
        majAttente(); return; }
      recuQuelqueChose = true;
      /* Chrome livre d'abord une version provisoire, puis la version confirmée.
         La provisoire s'écrit tout de suite dans la case et se corrige au fil
         de la phrase : l'élève voit son texte apparaître pendant qu'il parle. */
      if(champSocle !== champCourant){ champSocle = champCourant; socle = champCourant.value; }
      t = t.replace(/^\s+/, '');
      if(t){ socle = coller(socle, t); enAttente = ''; poser(socle); }
      else { enAttente = provisoire; poser(coller(socle, provisoire.replace(/^\s+/, ''))); }
    };
    reco.onerror = function(e){
      if(e.error === 'not-allowed'){ reco = null;   /* refus : on repartira d'un objet neuf */
        dire("Le micro a été refusé. Autorise-le dans la barre d'adresse, puis réessaie."); }
      else if(e.error === 'network') dire("La dictée a besoin d'une connexion internet.");
      else if(e.error !== 'no-speech' && e.error !== 'aborted') dire("La dictée s'est arrêtée (" + e.error + ").");
      if(e.error === 'no-speech' || e.error === 'aborted') return;   /* le micro reste ouvert */
      couperDictee();
    };
    reco.onstart = function(){ actif = true; };
    reco.onend = function(){
      actif = false;
      if(enMarche){ try{ reco.start(); }catch(e){ couperDictee(); } }
    };
    try{ reco.start(); }catch(e){ dire("La dictée n'a pas pu démarrer."); return; }
    enMarche = true;
    marcheVisible();
  }


  /* bandeau d'état : rappelle qu'il manque une case de réponse */
  /* le bouton Parler descend au niveau de la case en cours d'utilisation */
  function suivreCase(){
    var bm = document.getElementById('boite-micro');
    if(!bm) return;
    var pl = document.getElementById('place-micro');
    if(!champCourant){ bm.classList.remove('suit'); bm.style.top = '';
                       if(pl) pl.classList.remove('vide'); return; }
    var r = champCourant.getBoundingClientRect();
    var h = bm.offsetHeight || 46;
    var t = Math.min(Math.max(r.top - 6, 8), window.innerHeight - h - 8);
    bm.classList.add('suit');
    if(pl) pl.classList.add('vide');
    bm.style.top = Math.round(t) + 'px';
  }
  window.addEventListener('scroll', function(){ if(champCourant) suivreCase(); }, {passive: true});
  window.addEventListener('resize', function(){ if(champCourant) suivreCase(); });

  function majAttente(){
    if(!ecrit) return;
    var cons = document.getElementById('console-dictee');
    if(!cons) return;
    var t = cons.querySelector('.txt');
    if(t) t.textContent = champCourant ? 'Enregistre : parle'
                                       : 'Clique dans une case de réponse';
    cons.classList.toggle('attente', !champCourant);
  }
  /* affichage « micro en route », commun au premier démarrage et aux suivants */
  function marcheVisible(){
    ecrit = true; enAttente = ''; recuQuelqueChose = false;
    barriere = vus;                         /* la pause ne déborde pas sur la suite */
    if(champCourant){ socle = champCourant.value; champSocle = champCourant; }
    else { socle = ''; champSocle = null; }
    var bandeau = document.getElementById('etat-micro');
    if(bandeau){ bandeau.classList.remove('veille'); bandeau.classList.add('on');
                 bandeau.innerHTML = '<span class="rond"></span>Enregistre&hellip;'; }
    var cons = document.getElementById('console-dictee');
    if(cons){ cons.classList.add('on');
              document.getElementById('console-entendu').textContent = ''; }
    setTimeout(function(){                       /* rien entendu au bout de 6 s : on le dit */
      if(enMarche && !recuQuelqueChose)
        dire("Je n'entends rien. Vérifie que le micro est autorisé (icône dans la barre d'adresse) et que tu es connecté à internet.");
    }, 6000);
    btn.classList.add('ecoute-en-cours');
    btn.innerHTML = '<span class="rond"></span><span class="lab">Pause</span>';
    if(champCourant){ dire("Parle, le texte s'écrit dans la case."); champCourant.focus(); }
    else dire("Micro ouvert. Clique dans une case de réponse, puis parle.");
    majAttente();
  }

  if(btn) btn.addEventListener('mousedown', function(e){ e.preventDefault(); });
  if(btn) btn.addEventListener('click', function(){
    if(ecrit) { arreterDictee(); dire("En pause. Reclique sur Parler pour reprendre."); }
    else demarrerDictee();
  });



  var consStop = document.getElementById('console-stop');
  if(consStop) consStop.addEventListener('click', function(){
    arreterDictee(); dire('En pause. Reclique sur Parler pour reprendre.'); });

  document.getElementById('effacer').addEventListener('click', function(){
    if(!confirm('Effacer toutes les réponses de cette page ?')) return;
    memoire = {}; ranger();
    document.querySelectorAll('textarea.rep-saisie').forEach(function(t){ t.value=''; ajuster(t); });
    document.querySelectorAll('.page input').forEach(function(c){
      if(c.type === 'checkbox' || c.type === 'radio') c.checked = false; else c.value = '';
    });
    document.querySelectorAll('select.choix-liste').forEach(function(sel){ sel.value = ''; });
    if(document.querySelector('td.place')) location.reload();
  });
})();

/* ---- barre d'outils audio, créée ici et non recopiée dans chaque séance ---- */
document.body.insertAdjacentHTML('beforeend', '<div class="barre-audio">\n  <button id="aPlay" title="Lire la page">&#9654;</button>\n  <button id="aPause" title="Pause" disabled>&#10074;&#10074;</button>\n  <button id="aStop" title="Arrêt" disabled>&#9632;</button>\n  <button id="aRepeter" title="Réécouter ce passage" disabled>&#8635;</button>\n  <span class="etat" id="aEtat">&#9654; lire la page</span>\n  <span class="sep"></span>\n  <button id="aMoins" class="taille" title="Réduire le texte">A&minus;</button>\n  <button id="aPlus" class="taille" title="Agrandir le texte">A+</button>\n  <span class="sep"></span>\n  <button id="vMoins" class="taille" title="Parler moins vite">&#128034;</button>\n  <span class="etat" id="aVitesse" style="min-width:44px;text-align:center">&mdash;</span>\n  <button id="vPlus" class="taille" title="Parler plus vite">&#128007;</button>\n</div>');

(function(){
var EN_LIGNE = {B:1,I:1,EM:1,STRONG:1,SPAN:1,A:1,BR:1,SUP:1,SUB:1,U:1,SMALL:1,ABBR:1,IMG:1,SVG:1,KBD:1,CODE:1};
var file=[], enPause=false, btnActif=null, motises=[], idx=0, motCourant=0, motsLus=[];
var SIGLES = {CAP:'C.A.P.', EPC:'E.P.C.', PFMP:'P.F.M.P.', CCF:'C.C.F.', CDD:'C.D.D.',
              SAV:'S.A.V.', LP:'L.P.', TVA:'T.V.A.', CV:'C.V.'};
var dernier = null;
var vitesse = 0.63;
try{ var vv = localStorage.getItem('epc-vitesse3'); if(vv) vitesse = parseFloat(vv); }catch(e){}

/* ---------- voix ---------- */
function voix(){
  var v = speechSynthesis.getVoices().filter(function(x){ return /^fr/i.test(x.lang); });
  return v.filter(function(x){ return x.localService; })[0] || v[0] || null;
}
function etat(t){ document.getElementById('aEtat').textContent = t; }
function boutons(on){ document.getElementById('aPause').disabled=!on;
                      document.getElementById('aStop').disabled=!on;
                      document.getElementById('aRepeter').disabled = !on && !dernier; }

/* ---------- découpage d'un bloc en éléments lisibles ---------- */
function feuilles(racine, avecTableaux, avecBoutons){
  var out=[];
  (function creuser(el){
    if(el.classList && (el.classList.contains('ecoute') || el.classList.contains('ecoute-ligne'))) return;
    if(el.tagName==='BUTTON'){
      if(avecBoutons && txtVisible(el)) out.push(el);
      return;
    }
    if(el.tagName==='TABLE' && !avecTableaux) return;
    var enfants = [].filter.call(el.children, function(c){
      if(EN_LIGNE[c.tagName]) return false;
      if(c.tagName === 'BUTTON') return !!avecBoutons;
      if(c.tagName === 'TEXTAREA' || c.tagName === 'INPUT' || c.tagName === 'SELECT') return false;
      if(c.classList && c.classList.contains('enveloppe-rep')) return false;  /* case de réponse */
      return true;
    });
    if(!enfants.length){ if(txtVisible(el)) out.push(el); return; }
    enfants.forEach(creuser);
  })(racine);
  return out;
}
function txtVisible(el){ return (el.textContent||'').replace(/\s+/g,' ').trim().length > 1; }

/* ---------- habillage des mots (conserve gras, italique, .rep) ---------- */
function motiser(el){
  if(el._mots) return el._mots;
  var tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null), n, noeuds=[];
  while((n = tw.nextNode())) noeuds.push(n);
  var mots=[];
  noeuds.forEach(function(t){
    if(!/\S/.test(t.nodeValue)) return;
    var pt = t.parentNode.tagName;
    if((pt === 'BUTTON' && t.parentNode !== el) || pt === 'TEXTAREA' || pt === 'SCRIPT' || pt === 'STYLE') return;
    var frag=document.createDocumentFragment();
    t.nodeValue.split(/(\s+)/).forEach(function(m){
      if(m==='') return;
      if(/^\s+$/.test(m)){ frag.appendChild(document.createTextNode(m)); return; }
      var s=document.createElement('span'); s.className='mot'; s.textContent=m;
      frag.appendChild(s); mots.push(s);
    });
    t.parentNode.replaceChild(frag, t);
  });
  el._mots = mots; motises.push(el); return mots;
}
function demotiser(el){
  if(!el._mots) return;
  el._mots.forEach(function(s){
    if(s.parentNode) s.parentNode.replaceChild(document.createTextNode(s.textContent), s);
  });
  try{ el.normalize(); }catch(e){}
  el._mots = null; el._html0 = null;
}
function texteClair(el){
  /* écriture blanche sur fond coloré : le mot en bleu suffit, pas de fond jaune */
  var m = /(\d+),\s*(\d+),\s*(\d+)/.exec(getComputedStyle(el).color);
  if(!m) return false;
  return (0.299*(+m[1]) + 0.587*(+m[2]) + 0.114*(+m[3])) > 165;
}
function motLu(s){
  /* une réponse de corrigé masquée est en couleur transparente : on ne la lit pas */
  var c = getComputedStyle(s).color;
  return c.indexOf('rgba(0, 0, 0, 0)') === -1;
}

/* ---------- prononciation d'un élément ---------- */
function segment(el){ return {el: el}; }

function octets(s){                       /* longueur en octets UTF-8 */
  var n = 0;
  for(var i = 0; i < s.length; i++){
    var c = s.charCodeAt(i);
    if(c < 0x80) n += 1;
    else if(c < 0x800) n += 2;
    else if(c >= 0xD800 && c <= 0xDBFF){ n += 4; i++; }
    else n += 3;
  }
  return n;
}
function dire(i, depuis){
  idx = i; depuis = depuis || 0;
  if(i >= file.length){ arreter(true); return; }
  var seg = file[i], el = seg.el;
  document.querySelectorAll('.lu').forEach(function(e){ e.classList.remove('lu'); });
  document.querySelectorAll('.sur-clair').forEach(function(e){ e.classList.remove('sur-clair'); });
  if(texteClair(el)) el.classList.add('sur-clair'); else el.classList.add('lu');
  if(seg.aussi){ if(texteClair(seg.aussi)) seg.aussi.classList.add('sur-clair');
                 else seg.aussi.classList.add('lu'); }
  el.scrollIntoView({block:'center', behavior:'smooth'});

  motsLus = motiser(el).filter(motLu);
  if(depuis >= motsLus.length){ dire(i+1); return; }
  var texte='', deb=[], debO=[];
  for(var j = depuis; j < motsLus.length; j++){
    var m = motsLus[j].textContent;
    if(/^[\u2013\u2014\u2022\u00b7\-\u2605\u25cf\u2039\u203a]+$/.test(m)) m = ',';  /* tiret ou puce : une pause */
    else { var nu = m.replace(/[^A-Za-z]/g, ''); if(SIGLES[nu]) m = m.replace(nu, SIGLES[nu]); }
    deb.push(texte.length);
    debO.push(octets(texte));      /* même repère, compté en octets */
    texte += (m ? m + ' ' : ' ');
  }
  texte = texte.trim();
  if(!texte){ dire(i+1); return; }
  motCourant = depuis;

  var u = new SpeechSynthesisUtterance(texte);
  u.lang='fr-FR'; var v=voix(); if(v) u.voice=v; u.rate=vitesse;
  /* Chrome situe le mot en cours soit en caractères, soit en octets selon les
     versions : les accents décalaient alors le surlignage. On repère la bonne
     échelle au premier mot annoncé, puis on s'y tient. */
  var echelle = null;
  u.onboundary = function(e){
    if(e.name && e.name!=='word') return;
    if(echelle === null && e.charIndex > 0){   /* 0 ne départage pas les deux échelles */
      var dansC = deb.indexOf(e.charIndex) >= 0, dansO = debO.indexOf(e.charIndex) >= 0;
      if(dansC && !dansO) echelle = deb;
      else if(dansO && !dansC) echelle = debO;
    }
    var ech = echelle || deb;
    var k=-1;
    for(var j=0;j<ech.length;j++){ if(ech[j] <= e.charIndex) k=j; else break; }
    if(k < 0) return;
    motCourant = depuis + k;
    for(var j=0;j<motsLus.length;j++) motsLus[j].classList.toggle('lu', j===motCourant);
  };
  u.onend   = function(){ if(!enPause) dire(i+1); };
  u.onerror = function(){ if(!enPause) dire(i+1); };
  dernier = {f: file, i: i};
  speechSynthesis.speak(u);
  etat('Lecture — ' + (i+1) + ' sur ' + file.length);
  boutons(true);
}

function nettoyer(){
  document.querySelectorAll('.lu').forEach(function(e){ e.classList.remove('lu'); });
  document.querySelectorAll('.sur-clair').forEach(function(e){ e.classList.remove('sur-clair'); });
  motises.splice(0).forEach(demotiser);
  document.querySelectorAll('.ecoute.actif').forEach(function(b){
    b.classList.remove('actif'); b.innerHTML='&#9654;'; });
}
function lancer(segs, bouton, depuisSeg, depuisMot){
  speechSynthesis.cancel(); nettoyer();
  file = segs; enPause = false; idx = depuisSeg || 0; motCourant = 0; btnActif = bouton || null;
  if(bouton){ bouton.classList.add('actif'); bouton.innerHTML='&#10074;&#10074;'; }
  dire(idx, depuisMot || 0);
}
function arreter(fini){
  speechSynthesis.cancel(); enPause=false;
  file=[]; idx=0; motCourant=0;
  nettoyer(); boutons(false);
  etat(fini ? 'Terminé. Le bouton ↻ réécoute le dernier passage.' : 'Arrêté.');
}
function basculerPause(){
  if(!file.length) return;
  if(enPause){
    enPause = false;
    if(btnActif) btnActif.innerHTML='&#10074;&#10074;';
    etat('Lecture reprise.');
    dire(idx, motCourant);          /* reprise sur le mot où la voix s\'est arrêtée */
  } else {
    enPause = true;
    speechSynthesis.cancel();
    if(btnActif) btnActif.innerHTML='&#9654;';
    etat('En pause.');
  }
}

/* ---------- cliquer un mot pour partir de là ---------- */
function motSousLeCurseur(el, x, y){
  motiser(el);
  var cible = document.elementFromPoint(x, y);
  var mots = (el._mots || []).filter(motLu);
  for(var i = 0; i < mots.length; i++) if(mots[i] === cible) return i;
  return 0;
}
function clicDansBloc(bloc, boutonBloc, faire){
  bloc.addEventListener('click', function(e){
    var t = e.target;
    if(t.closest && t.closest('button, input, textarea, select, .etiq-mob, td.place, a, .som-lien, .sous-lien')) return;
    var segs;
    try{ segs = faire(); }catch(err){ return; }
    for(var i = 0; i < segs.length; i++){
      if(segs[i].el === t || segs[i].el.contains(t)){
        var m = motSousLeCurseur(segs[i].el, e.clientX, e.clientY);
        e.stopPropagation();
        lancer([segs[i]], null, 0, m);   /* une seule ligne : la voix s'arrête au bout */
        return;
      }
    }
  });
}

/* ---------- pose des boutons ---------- */
function apresLeTexte(el){
  /* insère juste après le texte lu, avant la case de réponse ou le tableau qui suit */
  var bloc = el.querySelector(':scope > .enveloppe-rep, :scope > table, :scope > .reserve,'
        + ' :scope > .colonnes, :scope > .champs, :scope > .photos, :scope > .plan,'
        + ' :scope > .grille2, :scope > textarea, :scope > select');
  return {parent: el, avant: bloc || null};
}

function ancre(cible, segs){
  if(/^H[1-6]$/.test(cible.tagName)) return {parent: cible, avant: null};
  if(cible.classList.contains('etiq-mob')) return {parent: cible, avant: null};
  if(cible.classList.contains('titre-fiche')) return {parent: cible, avant: cible.firstChild, bloc: true};

  /* une seule phrase : bouton à droite ; plusieurs phrases : en haut à droite du bloc */
  var phrases = 0;
  (segs || []).forEach(function(s){
    var t = (s.el.textContent || '').replace(/\s+/g, ' ').trim();
    phrases += Math.max(1, (t.match(/[.!?](\s|$)/g) || []).length);
  });
  if(segs && segs.length === 1 && phrases <= 1){
    var el = segs[0].el;
    var t1 = el.querySelector(':scope > .txt, :scope > .val, :scope > .quoi');
    if(t1) return {parent: t1, avant: null};
    return apresLeTexte(el);
  }

  var t = cible.querySelector(':scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > h5,'
        + ' :scope > .tete, :scope > .titre-consigne, :scope > .som-titre, :scope > figcaption');
  if(t) return {parent: t, avant: null};
  var txt = cible.querySelector(':scope > .txt, :scope > .val, :scope > .quoi');
  if(txt) return {parent: txt, avant: null};
  return {parent: cible, avant: cible.firstChild, bloc: true};   /* plusieurs parties : au-dessus */
}

function bouton(cible, titre, faire){
  try{ if(!faire().length) return null; }catch(e){ return null; }
  cible.classList.add('zone-audio');
  var b=document.createElement('button');
  b.className='ecoute'; b.title=titre; b.innerHTML='&#9654;'; b.tabIndex = -1; b.type = 'button';
  b.addEventListener('click', function(){
    if(b.classList.contains('actif')){ basculerPause(); return; }
    lancer(faire(), b);
  });
  var segs = faire();
  var a = ancre(cible, segs);
  if(a.bloc){
    b.classList.add('ecoute-bloc'); b._segs = segs; b._bloc = cible;
    cible.style.paddingRight = Math.max(44,
      parseFloat(getComputedStyle(cible).paddingRight) || 0) + 'px';
  }
  a.parent.insertBefore(b, a.avant);
  clicDansBloc(cible, b, faire);
  return b;
}

var titre = document.querySelector('.titre-fiche');
if(titre) bouton(titre, 'Écouter le titre', function(){
  return feuilles(titre, false).map(segment); });

document.querySelectorAll('h2.sect').forEach(function(t){
  bouton(t, 'Écouter le titre', function(){ return [{el: t}]; });
});
document.querySelectorAll('#nav-sec, .amorce, .rappel-dictee, .panneau, .panneau li, .doc-card, .champ, .activite, .consigne, .aide, .cv, .cv2 .haut, .cv2 .bloc, .question, .photos figure, .etiq-mob').forEach(function(bl){
  bouton(bl, 'Écouter ce bloc', function(){
    return feuilles(bl, false, bl.classList.contains('pager')).map(segment); });
});

document.querySelectorAll('table.tbl').forEach(function(tab){
  var ths = tab.querySelectorAll('thead th');
  if(tab.classList.contains('tbl-places')){
    /* tableau à étiquettes : le bouton se met dans la case du libellé, pas dans une colonne */
    [].forEach.call(tab.rows, function(tr){
      var enTete = !!tr.querySelector('th');
      var cibles = enTete ? [].slice.call(tr.cells) : [tr.cells[0]];
      cibles.forEach(function(c){
        if(!c || !txtVisible(c)) return;
        var b = document.createElement('button');
        b.className = 'ecoute-ligne'; b.innerHTML = '&#9654;'; b.tabIndex = -1; b.type = 'button';
        b.title = enTete ? 'Écouter ce titre de colonne' : 'Écouter cette ligne';
        b.style.marginLeft = '8px'; b.style.verticalAlign = 'middle';
        b.addEventListener('click', function(e){
          e.stopPropagation();
          lancer([{el: c}], null, 0, 0);
        });
        c.appendChild(b);
      });
    });
    return;
  }
  [].forEach.call(tab.rows, function(tr){
    var enTete = tr.parentNode.tagName === 'THEAD' || !!tr.querySelector('th');
    var lisible = [].some.call(tr.cells, function(td){ return txtVisible(td); });
    if(!enTete && !lisible) return;   /* ligne uniquement à remplir : pas de bouton */
    var c = document.createElement(enTete ? 'th' : 'td');
    c.className = 'col-ecoute';
    var b = document.createElement('button');
    b.className='ecoute-ligne'; b.innerHTML='&#9654;'; b.tabIndex = -1; b.type = 'button';
    b.title = enTete ? 'Écouter les titres des colonnes' : 'Écouter cette ligne';
    b.addEventListener('click', function(){
      var cells = [].filter.call(tr.cells, function(td){
        return !td.classList.contains('col-ecoute') && txtVisible(td); });
      lancer(cells.map(function(td, j){
        return {el: td, aussi: (!enTete && ths[j]) ? ths[j] : null}; }), null);
    });
    c.appendChild(b); tr.appendChild(c);
  });
});

/* un bouton de bloc devient inutile si chaque partie a déjà le sien */
document.querySelectorAll('.ecoute-bloc').forEach(function(b){
  var tout = (b._segs || []).every(function(s){
    var z = s.el.closest('.zone-audio');
    return z && z !== b._bloc;
  });
  if(tout && (b._segs || []).length){ b._bloc.style.paddingRight = ''; b.remove(); }
});

document.getElementById('aPause').addEventListener('click', basculerPause);
document.getElementById('aStop').addEventListener('click', function(){ arreter(false); });
document.getElementById('aRepeter').addEventListener('click', function(){
  if(file.length){ enPause = false; dire(idx, 0); return; }
  if(dernier){ lancer(dernier.f, null, dernier.i, 0); }   /* réécouter le dernier passage */
});
function segmentsPage(){
  var sec = document.querySelector('.sec.visible') || document.querySelector('.page') || document.body;
  return feuilles(sec, true).map(segment);
}
document.getElementById('aPlay').addEventListener('click', function(){
  if(enPause){ basculerPause(); return; }
  if(file.length) return;                       /* lecture déjà en cours */
  var segs = segmentsPage();
  if(!segs.length){ etat('Rien à lire sur cette page.'); return; }
  lancer(segs, null);
});
/* ---------- vitesse de la voix ---------- */
document.getElementById('aVitesse').textContent = Math.round(vitesse * 100) + ' %';
document.getElementById('vPlus').addEventListener('click', function(){
  vitesse = Math.min(1.3, Math.round((vitesse + 0.08) * 100) / 100); rangerVitesse(); });
document.getElementById('vMoins').addEventListener('click', function(){
  vitesse = Math.max(0.5, Math.round((vitesse - 0.08) * 100) / 100); rangerVitesse(); });
function rangerVitesse(){
  try{ localStorage.setItem('epc-vitesse3', vitesse); }catch(e){}
  document.getElementById('aVitesse').textContent = Math.round(vitesse * 100) + ' %';
  etat('Vitesse de la voix : ' + Math.round(vitesse * 100) + ' %');
  if(file.length && !enPause) dire(idx, motCourant);   /* reprend à la nouvelle vitesse */
}

/* ---------- taille minimale des textes à l'écran ---------- */
(function(){
  var page = document.querySelector('.page'); if(!page) return;
  [].forEach.call(page.querySelectorAll('*'), function(el){
    if(el.closest('.barre-audio, footer, .mention, .source') ||
       el.tagName==='BUTTON' || el.tagName==='SVG') return;   /* le pied de page reste petit */
    var t = parseFloat(getComputedStyle(el).fontSize);
    if(t && t < 15) el.dataset.gros = (t < 10.2) ? 's' : '';
  });
})();

/* ---------- taille du texte à l'écran (sans effet sur l'impression) ---------- */
var zoom = 1.3;
try{ var z = localStorage.getItem('epc-zoom'); if(z) zoom = parseFloat(z); }catch(e){}
function poserZoom(){
  zoom = Math.min(2, Math.max(1, Math.round(zoom*100)/100));
  document.documentElement.style.setProperty('--zoom', zoom);
  try{ localStorage.setItem('epc-zoom', zoom); }catch(e){}
}
poserZoom();
document.getElementById('aPlus').addEventListener('click', function(){ zoom += 0.15; poserZoom(); });
document.getElementById('aMoins').addEventListener('click', function(){ zoom -= 0.15; poserZoom(); });

speechSynthesis.getVoices();
})();
