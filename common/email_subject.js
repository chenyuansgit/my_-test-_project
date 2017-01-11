module.exports = function(resume,job_name,template){
    if(!template || template.replace(/major|male|-|school|education|job|name/g,'').length){
        return null;
    }
    try{
        var edu_list = JSON.parse(resume.education_detail);
        return template.replace('school',edu_list[0].school).replace('major',edu_list[0].major).replace('education',edu_list[0].stage).replace('male',resume.male>=1?'男':'女').replace('name',resume.name).replace('job',job_name);
    }catch (e){
        console.log(e);
        return null;
    }
};