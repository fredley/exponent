var exponent = {
  score: 0,
  coeffs: [1],
  init: function(){
    if("exponent" in localStorage){
      var data = JSON.parse(localStorage['exponent']);
      this.score = data.score;
      this.coeffs = data.coeffs;
      for(var i=1;i<=expo(this.coeffs.sum());i++) this.render_ach("upgrade",i);
      for(var i=1;i<data.coeffs.length;i++) this.add_coeff(i,false);
      this.tick(false);
    }
    this.hook_coeffs();
    window.timer = setInterval(function(){exponent.tick(true)},700);
    $('#reset').on('click',function(){exponent.reset();});
  },
  increment: function(){
    return parseInt(this.coeffs.slice().reverse().join(''));
  },
  tick: function(updateScore){
    if(updateScore) this.score += this.increment();
    for(var i=0;i<this.coeffs.length;i++){
      $('#coeff-' + i + '-disp').html(this.coeffs[i]);
      $('#popout-' + i + '-disp').html(comma(this.price(i)));
      if(this.price(i) > this.score){
        $('#popout-' + i + '-disp').addClass('disabled');
      }else{
        $('#popout-' + i + '-disp').removeClass('disabled');
      }
    }
    var exp = expo(this.score);
    if(!$('#coeff-' + exp).length){
      this.add_coeff(exp,true);
    }
    $('#score-disp').html(comma(this.score));
    $('#increment-disp').html(comma(this.increment()));
    localStorage["exponent"] = JSON.stringify({score:this.score,coeffs:this.coeffs});
  },
  add: function(i){
    if(this.score < this.price(i)) return;
    this.score -= this.price(i);
    this.coeffs[i] += 1;
    var count = expo(this.coeffs.sum());
    if(count > 0 && !$('#upgrade-'+count).length){
      this.render_ach("upgrade",count);
      this.hook_achievements();
    }
    this.tick(false);
  },
  render_ach: function(type,count){
    $('#ach-'+type).append($.templates("#ach_"+type+"_tmpl").render({
      count:count,
      roman:roman(count),
      comma:comma(Math.pow(10,count))
    }));
  },
  add_coeff: function(exp,push){
      $($.templates("#coeff_tmpl").render({x:exp})).insertBefore('#rhs');
      this.hook_coeffs();
      if(push) this.coeffs.push(0);
      $('#achievements').show();
      this.render_ach("count",exp);
      this.hook_achievements();
  },
  price: function(i){
    return Math.ceil(Math.pow(10,(i + 1)) * Math.max(Math.pow(i,0.5),1) * Math.pow(1.1 + 0.1*i,Math.pow(this.coeffs[i],1.1)));
  },
  hook_coeffs: function(){
    $('.coeff').off().hover(function(){$(this).parent().find('.popout').show();},
                            function(){$(this).parent().find('.popout').hide();}
                           ).on('click',
                            function(){exponent.add(parseInt($(this).attr('data-value')));}
                           );
  },
  hook_achievements: function(){
    $(".achievement").hover(function(){$(this).find('.tip').show();},
                            function(){$(this).find('.tip').hide();});
  },
  reset: function(){
    this.score=0;
    this.coeffs=[1];
    $('#ach-upgrade, #ach-count').html('');
    $('#achievements').hide();
    $('.rhs').remove();
    this.tick(false);
  },
};
$(document).ready(function(){exponent.init();});
Array.prototype.sum = function() {
    var total = 0; var i = this.length; 
    while (i--) total += this[i];
    return total;
}
function comma(x) {return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");}
function roman(num) {
    var digits = String(+num).split(""),
        key = ["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM","","X","XX","XXX","XL","L","LX","LXX","LXXX","XC","","I","II","III","IV","V","VI","VII","VIII","IX"],
        roman = "", i = 3;
    while (i--) roman = (key[+digits.pop() + (i * 10)] || "") + roman;
    return Array(+digits.join("") + 1).join("M") + roman;
}
function expo(x){return parseInt(String(x.toExponential()).split('+')[1]);}